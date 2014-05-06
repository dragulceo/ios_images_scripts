// enable double clicking from the Macintosh Finder or the Windows Explorer
#target photoshop

// debug level: 0-2 (0:disable, 1:break on error, 2:break at beginning)
// $.level = 0;
// debugger; // launch debugger on next line

var originalDoc, exports_launch, exports_icons, exports_facebook_icons, exports_facebook_images, exports, width, height, items, exportObj, newExport, item, n, doc, namePrefix, filename, orientation, extraSuffix, unit, options, extension, key;
// get a reference to the current (active) document and store it in a variable (it should be a square image of 2048px
originalDoc = app.activeDocument;

// we save first the ipad images then resize for iphone 4 inch and then we export for iphone 4 inch and iphone
exports_launch = {
     ipad: {
          size: [2048, 1536],
          retina: true,
          all_orientations: true
     },
     ipad_old_1: {
          size: [2048, 1496],
          retina: true
     },
     ipad_old_2: {
       size: [1536, 2008],
       retina: true
     },
     iphone_4_inch: {
          size: [640, 1136]
     },
     iphone: {
          size: [640, 960],
          retina: true
     }
};

exports_icons = {
	_1: {
		size: [114, 114],
		retina: true
	},
	_2: {
		size: [120, 120]
	},
	_3: {
		size: [144, 144],
		retina: true
	},
	_4: {
		size: [152, 152],
		retina: true
	},
	_5: {
		size: [58, 58],
		retina: true
	},
	_6: {
		size: [80, 80]
	},
	_7: {
		size: [100, 100],
		retina: true
	},
	_8: {
		size: [80, 80],
		retina: true
	}
};

exports_facebook_icons = {
	_1: {
		size: [16, 16]
	},
	_2: {
		size: [75, 75]
	},
	_3: {
		size: [128, 128]
	}
};

exports_facebook_images = {
	_1: {
		size: [155, 100]
	},
	_2: {
		size: [800, 150]
	},
	_3: {
		size: [180, 115]
	},
	_4: {
		size: [394, 150]
	}
};

exports = exports_facebook_images;

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
          namePrefix = originalDoc.name.replace(/\.[a-z]+$/, '') + '_' + orientation;
          extraSuffix = '';
          if (exportObj.retina) {
               halfDoc = doc.duplicate();
               app.activeDocument = halfDoc;
               halfDoc.resizeImage(UnitValue(width / 2, unit), UnitValue(height / 2, unit), null, ResampleMethod.BICUBIC);
               filename = namePrefix + '_' + (width) + '_' + (height) + extension;
               halfDoc.exportDocument(File(originalDoc.path + '/' + filename), ExportType.SAVEFORWEB, options);
               halfDoc.close(SaveOptions.DONOTSAVECHANGES);
          }
          filename = namePrefix + '_' + width + '_' + height + '@2x' + extension;
          doc.exportDocument(File(originalDoc.path + '/' + filename), ExportType.SAVEFORWEB, options);
          doc.close(SaveOptions.DONOTSAVECHANGES);
     }
}
