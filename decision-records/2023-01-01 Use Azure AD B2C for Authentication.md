Use Azure AD B2C for Authentication
-----------------------------------

**Status**: Accepted

### Context

Handling authentication and authorization is always a challenge, and in the world today it is ever more tricky as there are so many ways to gain unauthorized access. From user and password protection to multi factor authentication, there are a great number of ways security can be enhanced and implementing this on your own can be a great way to boost your software engineering skills. On the other hand, any minute spent implementing security features is a minute not spent on developing features regarding the project scope.

Luckily, Azure provides a way to completely delegate authentication and authorization using their well know and very well developed Active Directory technology as a service through Azure Active Directory Business to Clients (Azure AD B2C). It allows developers to configure user flows for different features, such as sign in and sign up as well as password resets, it comes packed with 3rd party authentication (log in with GitHub and through other platforms) as well as multi-factor authentication. Apart from this, it offers the possibility to fully customize the views that it exposes to the user making it possible to provide the same look and feel for users when they interact with this component.

One more benefit, the developer does not have access to the passwords making it more difficult for hackers to get a hold of them. The entire service is secured by Microsoft which has spent quite a lot of time making sure its servers cannot be breached. Obviously, this does not mean there is no chance that this could happen. It is very, very, very probable that their system is less vulnerable than a custom-made system and developed in a number of months, to be generous. Not to mention that they hire security experts to implement and maintain this system.

### Decision

Use Azure Active Directory Business to Clients service to handle all aspects concerning authentication and authorization. At this moment there are only two types of users: guests and members. A guest is any user that is not authenticated. Guests have their page navigation tracked (there really isn't much they can do anyway), but nothing specific is recorded, no IP addresses, no MAC addresses, just that there is a guest that has accessed the home page. It can be 1 million interactions from the same user, the recorded traffic information will not be able to distinguish if it was just one user, or a bot, that has done this or if there are multiple guests. This is to ensure user protection and to not track any identifying information about the user.

The other type, or category, of users are members. These are authenticated users meaning they have an associated display name, and more importantly, a unique ID. Specific members are tracked by their ID, not by display name, for statistics. This is mostly for identifying what users are mostly interested in the application, do they have a lot of expenses views? Are they looking a lot through the investments tracking? What are they up to. All this tracking will be done at a later stage through Azure Application Insights and a respective decision record will be made.

### Consequences

Using Azure AC B2C places a very critical dependency on the Azure platform making it much harder to move away to any other cloud platforms.

Having the service handle all aspects around authentication and authorization comes with a lot of trust that the service works and that it is reliable. It is true that if something bad happens in this regard it can be blamed on Azure or Microsoft, but the result will be that users will trust the application less regardless of this dependency. It may be a Microsoft mess-up at that point, but it was the developer’s decision to trust this service in the first place. Although it is a delegated responsibility, this does not absolve the developer from the responsibility of ensuring user security in the application.

Last, but not least, a lot of development time is saved by using a platform that covers a critical area of the application, not to mention the boost in security by using a service that has been developed, improved and maintained for years and making a serious effort to keep up with industry standards.