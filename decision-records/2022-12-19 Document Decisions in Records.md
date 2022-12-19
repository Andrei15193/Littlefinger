Document Decisions in Records
-----------------------------

**Status**: Accepted

### Context

After working on several software projects, one of the lacking aspects of most, if not all, is documentation. It either is high level without many details or is just missing.

The issue with documentation is that it may be boring to write, and boring to read, and boring to maintain. This brings the need to have documentation concise and broken in small chunks making it easier to read. Having smaller diagrams rather than a gigantic one which is mostly useful when a great degree of the software implementation is known, or when having a presentation about the project.

### Decision

Maintain decision records using [Michael Nygard’s decision record template](https://github.com/joelparkerhenderson/architecture-decision-record/blob/315e9b721b8c3719573a3ef68d5163a082c22a6c/templates/decision-record-template-by-michael-nygard/index.md). This is a link to a specific committed version and the latest as of the moment of writing this. In order to change the template there will need to be an additional decision record stating that and why. To learn more about Architecture Decision Records, check [Joel Parker Henderson](https://github.com/joelparkerhenderson)’s [architecture-decision-record](https://github.com/joelparkerhenderson/architecture-decision-record) repository.

The reason for using this template is because it is simple. This is a small project and at the moment of writing this it is only me who is writing code to implement features. I would like to keep track of the decisions I make, but I do not want to make it overly complicated for myself.

The name of the file starts with the date of the decision, even if the decision may of been made in the past, the date when it was recorded (i.e. when the corresponding file was written) is the one that is used followed by the title of the decision.

The title of the decision record contains an action that indicates what to do, a directive of sorts. The decision is to do something and that should be illustrated in the title.

Possible statuses are `Proposed`, `Accepted`, `Obsolete`. In case of a new decision record obsoleting a previous one, the previous one shall be updated to point to the latest and this is done as many times as a decision regarding the same aspect is being made. All obsoleted decision records point to the latest at all times.

Use this decision record as an example.

### Consequences

More work maintaining this repository, as well as actually maintaining this repository. Even if it is just me working on this, it is good exercise nonetheless. If you want to get good at something you start by doing.