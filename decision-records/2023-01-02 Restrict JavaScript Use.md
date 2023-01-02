Restrict JavaScript Use
-----------------------

**Status**: Accepted

### Context

Part of the project technical challenge is to create a classic Multi-Page Application which means that most, if not all, of the processing happens on the back-end, on the server itself. Once that is done, a complete HTML page is generated and sent to the browser so that the user may have have a visual display of the result.

All this back and forth meas that on the front-end side there is mostly just HTML and CSS and all the running code is on the back-end. There should be no JavaScript on the front-end. This is basically the challenge as I've been working on Single-Page Applications for so long I instinctively just do things in JavaScript that gets executed on the browser and things are easier in that regard. Having this limitation will challenge technical skills and provide concrete scenarios where things are done differently than they would be made in a Single-Page Application.

### Decision

Reduce to the absolute minimum the amount of code that runs in the browser. The only acceptable JavaScript is from Bootstrap as it is used for different components, such as dropdowns and modals. Other than that, there should be no JavaScript in the browser unless there is no other way.

### Consequences

By moving the entire processing on the back-end this frees up browser resources making it less demanding of the user's machine. On the other hand, the interaction may not be the same as any update that changes how to page is displayed requires an entire page refresh. It is required to generate a new, modified HTML page which can only be done by the back-end.