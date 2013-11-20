// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 0;
// debugger; // launch debugger on next line

var originalDoc, exports, width, height, items, exportObj, newExport, item, n, doc, newName, orientation, extraSuffix, unit, options, extension;
// get a reference to the current (active) document and store it in a variable (it should be a square image of 2048px
originalDoc = app.activeDocument;

// we save first the ipad images then resize for iphone 4 inch and then we export for iphone 4 inch and iphone
exports = {
     ipad: {
          size: [2048, 1536],
          retina: true,
          all_orientations: true
     },
     ipad_old: {
          size: [2048, 1496],
          retina: true,
          all_orientations: true
     },
     iphone_4_inch: {
          size: [640, 1136]
     },
     iphone: {
          size: [640, 960],
          retina: true
     }
};

unit = 'px';
// our web export options
options = new ExportOptionsSaveForWeb();
options.format = SaveDocumentType.PNG;
options.optimized = true;
options.PNG8 = false;

extension = '.png';


for (key in exports) {
     item = exports[key];
     items = [item];
     if (item.all_orientations) {
          newExport = {
               size: [item.size[1], item.size[0]]
          };
          if (item.retina) {
               newExport.retina = item.retina;
          }
          items.push(newExport);
     }

     n = items.length;
     while (n--) {
          exportObj = items[n];
          doc = originalDoc.duplicate();
          app.activeDocument = doc;
		  executeAction(charIDToTypeID('MrgV'), undefined, DialogModes.NO);
          width = exportObj.size[0];
          height = exportObj.size[1];

          //if we have both widh and height different we resize to the largest 
          if (doc.width != width && doc.height != height) {
               if (width > height) {
                    doc.resizeImage(UnitValue(width, unit), null, null, ResampleMethod.BICUBIC);
               } else {
                    doc.resizeImage(null, UnitValue(height, unit), null, ResampleMethod.BICUBIC);
               }
          }
          doc.resizeCanvas(UnitValue(width, unit), UnitValue(height, unit));
		  orientation = (n === 1 ? 'portrait' : 'landscape');
          newName = 'launch-image-' + originalDoc.name.replace(/\.[a-z]+$/, '') + '_' + width + '_' + height + '_' + orientation;
          extraSuffix = '';
          if (exportObj.retina) {
               halfDoc = doc.duplicate();
               app.activeDocument = halfDoc;
               halfDoc.resizeImage(UnitValue(width / 2, unit), UnitValue(height / 2, unit), null, ResampleMethod.BICUBIC);
               halfDoc.exportDocument(File(originalDoc.path + '/' + newName + extension), ExportType.SAVEFORWEB, options);
               halfDoc.close(SaveOptions.DONOTSAVECHANGES);
               newName += "@2x";
          }
          doc.exportDocument(File(originalDoc.path + '/' + newName + extension), ExportType.SAVEFORWEB, options);
          doc.close(SaveOptions.DONOTSAVECHANGES);
     }
}
