## alpaca-management-webpart

Using SPFx, Office UI Fabric React, Graph SDK and various other bits, this SPFx webpart connects to the Microsoft Graph for an organization and pulls all users. It then represents each one as an Alpaca icon that can be dragged and dropped into one of the Alpaca Pens for hours of fun and enjoyment. 

> New! Alpaca Management Webpart now lets you export your managed Alpaca to an XLSX spreadsheet! Master of Business in Alpaca (MBA) here you come!

> New! Alpaca Management uses browser storage so that your progress is stored and the Alpaca don't need to be moved as frequently. The alpaca love that!

In Action:
<p align="center">
  <img src="https://github.com/spit-happens/alpaca-management-webpart/blob/master/Alpaca.gif?raw=true" width="500">
</p>

ScreenShot:
<p align="center">
  <img src="https://github.com/spithappens/alpaca-management-webpart/blob/master/AlpacaManagementScreenshot-4.png?raw=true" width="1200">
</p>

### Why?

For fun, mostly. This webpart demonstrates how to access the MS Graph API from a SharePoint Framework Webpart and visualize the results in a slightly different manner that we're accustomed to in SharePoint. In doing so, it also shows off some pretty sweet components - React DnD, Office UI Fabric React, Microsoft Graph Client, localforage, and Sheet.js (xlsx) to coax the creative development juices to start flowing.

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
