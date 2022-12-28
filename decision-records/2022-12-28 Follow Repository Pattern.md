Follow Repository Pattern
-------------------------

**Status**: Accepted

### Context

After working on the project for a bit, it became more and more obvious that data storage is not something that is simple enough to be done in request handlers, even for simple scenarios like editing an expense. Even though what happens is relatively simple, an entity is replaced in Azure Table Storage, however tags are indexed as well as a few other entities. This instinctively translates into one or multiple functions that handle this.

The next issue that emerges is that the functions that index tags, shops and currencies are exactly the same thus they must be made generally available for all request handlers that manage expenses. Each function has a number of dependencies, for adding and editing expenses in a direct way is just the table storage.

Needless to say, it would be nice to have an object that can handle these operations which would represent a collection of expenses. This was the first Data Access Object that managed expense entities, then a similar Data Access Object was defined to handle tags. A lot of simplification was made with this as each request handler could create these objects just by passing an Azure Storage Table Client (SDK dependency).

The next issue that had to be addressed were outages. Although not expected to happen often, the code should be robust to handle Azure Storage outages or errors that may happen every now and then. Regardless of what happens, the code is not allowed to corrupt application data by assuming that if one Azure Storage operation succeeds in a request handler, all of the following ones will succeed as well. A hardware issue may arise right in the middle of the execution of a request handler meaning that some operations may succeed while others may not. The code must be written in a way that even if something like this happens the data remains consistent.

When it comes to Azure Table Storage, all operations on a partition are atomic (a partition is defined by the table name and partition key). Multiple operations performed on a partition that need to be atomic are wrapped in a batch operation. There are limitations on these operations, however you must be handling quite a large amount of data in a batch operation to reach them. It is still something to take into consideration, nonetheless.

This added complexity to the request handler as the Data Access Object specific to each entity did not fully handle these scenarios, mostly having to do with error handling. On top of this the issue of moving an expense from one month to another had to be addressed.

All expenses in a month are stored in a single partition making it easy to retrieve them when viewing the expenses made in a month, this means that the month the expense was made in is part of the partition key. The partition key is one of the key components of an entity in Azure Table Storage. Basically, the ID or key of an entity is composed by the table name (this is implicit as operations are carried out on a table, this applies to partitions as well, two entities having the same partition key that are in different tables are part of different partitions), partition key and row key. To change the partition key of an entity means to create a copy with the updated partition key and delete the other one.

How would this be handled without adding duplicates? We cannot use batch operations as two partitions are involved meaning that we must perform two separate operations. One that deletes and one that creates. What would happen if right in between those two operations there is a failure of some kind and the create operation is not performed? This means data loss for the user without them even knowing about it. Performing the operations the other way around, create then delete, can lead to duplicate data as the same expense would remain logged for both months, again, without the user really knowing. They would have to manually check if there indeed is a duplicate and, in that case, to delete the extra expense or retry the month change operation.

This is likely to be an issue that will show itself in the future in different forms, the solution was to move the month change to a background processor. Basically, any operation that involves multiple partitions for data consistency, is performed on a background processor and the respective entity has an associated state which indicates the state of the operation. There is no successful state as the lack of any state information means it is in a valid state. While the background processor is awaited to do the work, the entity is in a "change requested" state and remains in that way for up to 1 hour. If this time elapses, then it is skipped from background processing or if the background processing resulted in an error, then the entity is updated to display a warning alongside a custom message, specific to the requested background operation, allowing the user to know that the operation was not carried out and that they should retry it. If the operation succeeds, then the state is cleared and everything goes as expected.

This covers all scenarios as the "change requested" has an expiration, it can act as a lock mechanism as well. If the entity change request expires then a warning is shown. The warning is cleared when the entity is saved (even with no change). If the operation fails or partially succeeds, the operation will expire once again. The warning is the key element here as it informs the user specifically which expense had issues and what was the change request that failed so they can more easily check their data and make sure it is consistent.

With the Data Access Object approach, all of this would have been implemented mostly in request handlers which would of leaked storage logic inside request handlers that should not normally be there. It is not just the editing of expenses but retrieving the list of expenses as well. When displaying expenses, the respective request handler needs to know about the various states, which is normal, as well as how they are actually stored, which over complicates the request handlers. The logic of storing and retrieving this information as well as materializing it in a way that can be passed to the view is spread across multiple objects, and worse, it is somewhat implicit. You would need to know at which objects to look at to infer the entire logic.

All this has led to the decision to use the Repository pattern to make this logic explicit and encapsulated in a single object.

### Decision

Follow the Repository pattern which uses Data Access Objects offered by Software Development Kits (SDKs) to perform the operations. A single repository for managing expenses is responsible for performing all storage operations related to an expense, including the indexing of tags. A repository can retrieve, create, edit and delete any number of entities as well as adding queue messages for background processes.

Multiple repositories can perform operations on multiple Azure Storage Tables, this will eliminate dependencies between repositories as each can act independent of each other. The Azure Table Storage layer must always remain consistent, after each operation!

A repository exposes domain objects and internally deals with storage specific types. It doesn't just map one to another it also encapsulates the logic for storing all this data. If there are any failing operations a common Data Storage Exception is thrown which is part of the domain space meaning it has to abstract some of the concrete storage details and provide useful summarized information such as "Not found", or "Duplicate". If the SDK performs a REST call behind the scenes and the status code is 404 then this information should not be leaked further and instead provide a summarized state, "Not Found". On the other hand, the initial exception should be wrapped for logging and debug purposes.

Azure Table Storage uses an optimistic concurrency mechanism through etags. When you query an entity, you also get an etag which ensures that if you subsequently perform an operation that changes said entity it is in the same state as when it was retrieved. Upserts do not have this mechanism as they may insert data if it does not exist or update it if they exist. Their use is specific and generally do not require an etag as the scenarios when it would be used are along the lines of "make sure you have this, and in this state", such as indexing.

All operations must use an etag, there is a default etag that matches everything meaning a force operation rather than a concurrent operation. Because of this, the etag concept becomes part of the domain and is passed through related domain entities. Etags are not expected to be generated, they are more like a token that is passed around, like how IDs are generated and passed around with a relational database approach. They are not necessarily part of the problem domain; however, they are made part of the domain model from a technical standpoint.

The Azure Storage Data Access Objects are aggregated and made available through a single object that represents a single Azure Storage Account. It exposes tables, queues, and, later on, blobs or blob containers. This is to make the structure known and ensure that there are no typos in the name of each collection as well as making it easy to use with dependency injection. One object to aggregate them all, one object to make them available, and in the repository.. connect them.

Changes that involve multiple partitions concerning a single entity, such as changing the partition in which an expense is stored, are performed through a background processor. The change request is made through an Azure Queue Storage message which triggers a function in the related Functions App. This mechanism will be useful when generating reports as well.

* [Repository Class Diagram](https://raw.githubusercontent.com/Andrei15193/Littlefinger/dev/decision-records/Repository%20Class%20Diagram.png)

### Consequences

This has a great benefit as there is a clear separation and direction on how to manage data changes at the storage level. All this logic is encapsulated inside a single object.

Having repositories makes it easy to inject them inside request handlers and have them focus on form and filter processing more than on how the storage works.

Having the storage layer abstracted in this way allows for mocks or stubs to be easily created and make the request handlers more easily testable.

A drawback is that a repository can perform operations on multiple tables meaning that there can be an overlap between multiple repositories. Each must ensure that it leaves the data in a consistent state after each single operation.