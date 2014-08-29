jQuery.colorpicker
==================
v1.0.9

Copyright &copy; 2011-2014 Martijn W. van der Lee (http://martijn.vanderlee.com).
Licensed under the MIT.

Full-featured colorpicker for jQueryUI with full theming support.
Most images from jPicker by Christopher T. Tillman.
Sourcecode created from scratch by Martijn W. van der Lee.

IE support; make sure you have a doctype defined, or the colorpicker will not display correctly.

Features
--------
-	jQueryUI (themeroller-based) look & feel
-	Familiar interface layout
-	Highly configurable
	-	Control parts
	-	Layout
	-	Input/output formats
	-	Swatches
	-	Many more
-	Accurate color model
-	Supports localization
	-	English, Dutch, French, etc.
	-	Easily translateable (https://www.transifex.com/projects/p/jquery-colorpicker/)
-	Smart window alignment
-	Complete API with events and methods
-	Easily extendable with plugins
	-	Many examples included: RGB-Sliders with CSS gradients, Per-user cookie memory for colors.
-	Documented
-	Limited Unit tests (QUnit-based)

Download
--------
jQuery v1.7.1 or higher required. (Will not work with v1.6 or before).

jQueryUI v1.8.0 or higher required.

Current version: https://github.com/vanderlee/colorpicker/archive/master.zip

Sourcecode on Github: https://github.com/vanderlee/colorpicker

Browser support
---------------
Tested with v1.0.7

-	Chrome 31
-	FireFox 25
-	Opera 17
-	Internet Explorer 10

Documentation
=============
`.colorpicker(options)`
--------------------
Turns an element into a colorpicker.

Options
-------
### alpha (false)
Whether or not to show the inputs for alpha.

### altAlpha (true)
Change the opacity of the altField element(s) according to the alpha setting.

### altField ('')
Change the background color of the elements specified in this element.

### altOnChange (true)
If true, the altField element(s) are updated on every change, otherwise
only upon closing.

### altProperties (background-color)
Comma-separated list of CSS properties to set color of in the altField.
The following properties are allowed, all others are ignored.

*	``background-color``
*	``border-color``
*	``color``
*	``fill``
*	``outline-color``
*	``stroke``

###	autoOpen (false)
If true, the dialog opens automatically upon page load.

###	buttonClass (null)
If this option is set to a string, the button will be assigned the
class specified.

###	buttonColorize (false)
If a buttonimage is specified, change the background color of the
image when the color is changed.

###	buttonImage ('images/ui-colorpicker.png')
Same as jQueryUI DatePicker.

###	buttonImageOnly (false)
Same as jQueryUI DatePicker.

###	buttonText (null)
Same as jQueryUI DatePicker. If null, use language default.

###	closeOnEscape (true)
Close the window when pressing the Escape key on the keyboard.

###	closeOnOutside (true)
Close the window when clicking outside the colorpicker display.

###	color ('#00FF00')
Initial color. Formats recognized are:

*	#rrggbb
*	rrggbb (same as previous, but without the #)
*	rgb(rrr,ggg,bbb)
*	rgba(rrr,ggg,bbb,a.a)
*	rgb(rrr%,ggg%,bbb%)
*	rgba(rrr%,ggg%,bbb%,aaa%)
*	w3c-defined color name

###	colorFormat ('HEX')
Specifies the format of the color string returned in callbacks.
You can either specify one of the predefined formats:

*	``#HEX``	#112233
*	``#HEX3``	#123 if possible, otherwise false.
*	``HEX``		112233
*	``HEX3``	123 if possible, otherwise false.
*	``RGB``		rgb(123,45,67) if opaque, otherwise false.
*	``RGBA``	rgba(123,45,67,0.123%)
*	``RGB%``	rgb(12%,34%,56%) if opaque, otherwise false.
*	``RGBA%``	rgba(12%,34%,56%,0.123%)
*	``HSL``		hsl(123,45,67) if opaque, otherwise false.
*	``HSLA``	hsla(123,45,67,0.123%)
*	``HSL%``	hsl(12%,34%,56%) if opaque, otherwise false.
*	``HSLA%``	hsla(12%,34%,56%,0.123%)
*	``NAME``	Closest color name
*	``EXACT``	Exact name if possible, otherwise false.

or specify your own format...
Each color channel is specified as a pair of two characters.
The first character determines the color channel:

*	``a``			Alpha
*	``r, g, b``		RGB color space; red, green and blue
*	``h, s, v``		HSV color space; hue, saturation and value
*	``c, m, y, k``	CMYK color space; cyan, magenta, yellow and black
*	``L, A, B``		LAB color space; Luminosity, *A and *B.

The second character specifies the data type:

*	``x``			Two-digit hexadecimal notation.
*	``d``			Decimal (0-255) notation.
*	``f``			Floating point (0-1) notation, not rounded.
*	``p``			Percentage (0-100) notation, not rounded.

If you prefix a valid pair with a backslash, it won't be replaced.
All patterns are case sensitive.
For example, to create the common hex color format, use "#rxgxbx".
For an rgba() format, use "rgba(rd,gd,bd,af)"

You can also specify an array of formats where the first non-FALSE one
is returned. Note that the only formats able to return FALSE are the
predefined formats HEX3 and EXACT. For example, this array will output
HEX3 format if possible or HEX format otherwise:

*	``['HEX3', 'HEX']``

###	draggable (true)
Make the dialog draggable if the header is visible and the dialog is
not inline.

###	containment (null)
If the dialog is draggable, constrains dragging to within the bounds of the
specified element or region. Same as jQueryUI Draggable.

###	duration ('fast')
Same as jQueryUI DatePicker.

###	hsv (true)
Whether or not to show the inputs for HSV.

###	inline (true)
If set to false, attaching to a non-input will still make the dialog
a popup instead of inline. Make sure you handle events to catch the
color change, otherwise you can't use the color.

###	inlineFrame (true)
If enabled, shows a border and background when inline. Disabling may
allow closer integration.

###	layout ({ ... })
Set the position of elements in a table layout.
You could create any layout possible with HTML tables by specifying
cell position and size of each part.
@todo document how this works.

###	limit ('')
Limit the selectable colors to any of the predefined limits:

*	``''``		No limitations, allow 8bpp color for a palette of all 16 million colors.
*	``websafe``	Set of 216 colors composed of 00, 33, 66, 99, cc and ff color channel values in #rrggbb.
*	``nibble``	4 bits per color, can be easily converted to #rgb format. The palette is limited to 4096 colors.
*	``binary``	Allow only #00 or #ff as color channel values for primary colors only; only 8 colors are available with this limit.
*	``name``	Limit to closest color name.

###	modal (false)
Ensures no other controls on screen can be used while the dialog is
opened.
Also look at showCancelButton and closeOnEscape to use in combination
with the modal option. closeOnOutside is redundant when used with modal.

###	mode ('h')
Determines the functionality of the map and bar components. Allowed
values are; 'h', 's', 'l', 'r', 'g', 'b' or 'a', for hue, saturation,
luminosity, red, green, blue and alpha respectively.

###	okOnEnter (false)
Close the window when pressing the Enter key on the keyboard, keeping the selected color.

### part
Use the part option to specify options specific to parts (including plugin parts).
By default, the following part options are available:

###	parts ('')
Determine which parts to display.
Use any of the preset names ('full', 'popup' or 'inline') or specify an array
of part names (i.e. ['header', 'map', 'bar', 'hex', 'hsv',
'rgb', 'alpha', 'lab', 'cmyk', 'preview', 'swatches', 'footer']).
If an empty string is given, the parts will be automatically chosen as
preset 'popup' or 'inline' depending on the context in which the
colorpicker is used.

###	regional ('')
Sets the language to use. Note that you must load the appropriate language file
from the i18n directory. '' is included by default.

### revert (false)
If enabled, closing the dialog through any means but the OK button will revert
the color back to the previous state, as if pressing the Cancel button.
The revert option changes the behaviour of the [X] button in the header, the
Escape keyboard button and clicking outside the dialog, when any of these
features are enabled.

###	rgb (true)
Whether or not to show the inputs for RGB.

###	showAnim ('fadeIn')
Same as jQueryUI DatePicker.

###	showCancelButton (true)
Show the Cancel button if buttonpane is visible.

###	showCloseButton (true)
Show the Close button if the header is visible.
If the dialog is inline, the close button is never shown.

###	showNoneButton (false)
Show the None/Revert button if buttonpane is visible.

###	showOn ('focus click alt')
Specifies what user events will show the
colorpicker if not inline. Specify multiple events by seperating with
space.
Optionally 'focus', 'click', 'alt', 'button' and/or 'both'

*	``focus``	When the element comes into focus (either tab or click)
*	``click``	When the element is clicked (for non-inputs)
*	``alt``		When clicking on an element specified with as altField
*	``button``	When clicking on the button created if this event is specified.
*	``both``	selects all possible triggers

###	showOptions ({})
Same as jQueryUI DatePicker.

###	swatches (null)
'null' to show swatches of HTML colors or provide your own object
with colornames and {r:1, g:1, b:1} array.
For example { 'red': {r:1, g:0, b:0}, 'blue': {r:0, g:0, b:1} }
Alternatively, load a predefined set of swatches and specify the name.
For example, for the pantone set, specify 'pantone'.

###	swatchesWidth (84)
Width of the swatches display in pixels.

###	title (null)
Title to display in the header. If null, use language default.

Events
------
###	init(formatted, colorPicker)
Triggered on initially setting the color. Called only once.
Callbacks recieve same data as select event.

###	close(formatted, colorPicker)
Triggered when the popup is closed.
Callbacks recieve same data as select event and an additional number
of fields containing the current color in all supported color spaces.
These are rgb{}, hsv{}, cmyk{}, lab{}, hsl{} and a.
Most values are floating point numbers in range [0,1] for accuracy.
The a and b values in the lab color space have range [-1,1].

###	select(formatted, colorPicker)
Triggered on each change, confirmation (click on OK button) and
cancellation (click on Cancel, outside window or window close button)
respectively.

The event recieves a jQuery event object, a data object containing the elements
'formatted' (with the color formatted according to formatColor) and the
Colorpicker element that triggered the event.

Note that select may be triggered in rapid succession when dragging
the mouse accross the map or bar and may be triggered without a change
in color upon specific user interactions.

Methods
-------
###	open
Open the dialog

###	close
Close the dialog

###	destroy
Destroy the widget

###	setColor
Set the current color to the specified color. Accepts any CSS-confirming color
specification.

Plugins
-------
Colorpicker is extensible with several types of plugins. A number of plugins
is provided for use. The plugins are constructed such that you only need to
load the javascript file after the Colorpicker plugin itself is loaded.

###	limits
Limits let you limit the possible colors, as used by the 'limit' option.

No plugins included.

### parsers
Parser take a textual representation of a color and return a Color object.
If no match is found, nothing is returned and the next parser is tried.
Parsers are tried in order of appearance.

Included plugins:
*	``cmyk-parser``				Parses a ``cmyk(c, y, m, k)`` format, similar to rgba.
*	``cmyk-percentage-parser``	Parses a ``cmyk(c%, y%, m%, k%)`` format with percentages.

###	parts
You can add additional visual parts, usually controls, that interact
with the rest of Colorpicker framework.

Included plugins:
*	``memory``		Cookie-based memory nodes.
*	``rgbsliders``	Set of three red/green/blue sliders with dynamically adjusted gradients.

###	partslists
Partslists are a convenient way to select multiple parts at once without having to specify each one individually.

No plugins included.

###	regional
Regional (in the i18n directory) plugins contain localized texts
(a.k.a. translations). A number of languages is provided.

Included regionals:
*	``de``		German (Deutsch).
*	``en``		English (default).
*	``fr``		French (Francais).
*	``nl``		Dutch (Nederlands).
*	``pt-br``	Brazilian Portuguese.

###	swatches
Swatches are collections of predefined and named colors. By default the
standard ``html`` colors are loaded.

Included plugins:
*	``crayola``		Crayola pencil color names
*	``pantone``		Pantone color codes
*	``ral-classic``	Classic RAL paint numbers

###	writers
Writers take a Color object and output a textual representation of the color.
Writers are used for the colorFormat option.

No plugins included.

Objects
-------
Colorpicker uses a Color object internally to represent a color and convert
between the supported color models.
You can create a new Color object through $.colorpicker.Color.
