Scripts for generating iOS, Facebook icons and lunch images
===========================================================

Scripts that generate (by resizing) images in the resolutions needed for an iOS application


Node with convert and inkscape
------------------------------

If node and convert is installed and there is a file `logo.png` (should be a large image (eg. 1024x1024 or more))
the generation/resize can be done just by running:

`node images_generate.js ../logo.png`

An additional option provided for selecting the dimensions type (values are the keys inside `dimensions.json`).

`node images_generate.js ../logo.png icons`

Photoshop
---------
* Export iOS Launch Images.jsx - Photoshop script (JavaScript) to export launch images 
for an universal application starting from a square psd with 2048 pixels in width.

*How to use*: Open the source psd file in photoshop and then File -> Scripts -> Browse... 
select this script and BAM! the images start being generated. 



