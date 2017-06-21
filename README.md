## alpaca-management-webpart

Using SPFx, Office UI Fabric React, Graph SDK and various other bits, this SPFx webpart connects to the Microsoft Graph for an organization and pulls all users. It then represents each one as an Alpaca that can be dragged and dropped into one of the Alpaca Pens for hours of fun and enjoyment.

<p align="center">
  <img src="https://github.com/spithappens/alpaca-management-webpart/blob/master/AlpacaManagementScreenshot-2.png?raw=true" width="1200">
</p>

### Building the code

```bash
git clone the repo
npm i
npm i -g gulp
gulp
```

This package produces the following:

* lib/* - intermediate-stage commonjs build artifacts
* dist/* - the bundled script, along with other resources
* deploy/* - all resources which should be uploaded to a CDN.

### Build options

gulp clean - TODO
gulp test - TODO
gulp serve - TODO
gulp bundle - TODO
gulp package-solution - TODO
