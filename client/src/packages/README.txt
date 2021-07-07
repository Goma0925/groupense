This directory represents standalone modules that can hypothetically be exported from the project entirely. 
These modules do not contain business logic related to the application itself. 
Think open-source code that isn’t open-source yet. Ask yourself, “Can another team benefit from this code?” Like utilities, 
you may call this directory whatever makes sense for you and your team, such as src/open-source, src/packages, 
src/shared, or src/standalone. Example modules include home-rolled translation systems, useful implementations of complex algorithms 
and data structures, or highly reusable components that may offer valuable functionality to other teams. 

For CloudWatch Logs, our team extended Airbnb’s react-dates component in order to add a time selection in addition to its built-in date selection.
This new component was standalone and offered value to other teams. 
While we developed it in the standalone modules directory, we were able to strip it from the project entirely with minimal effort 
once we had fully extended, tested, and vetted it. It is now used by other AWS teams, 
and we receive the benefits of those teams’ feature contributions and bug fixes. 