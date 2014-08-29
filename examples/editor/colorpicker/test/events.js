module('events');

test("Empty input value should not set altField background to black", function() {
	expect(4);

	var $input = $('<input type="text" value=""/>').appendTo("#qunit-fixture");
	var $altfield = $('<div/>').appendTo("#qunit-fixture");
	
	equal($altfield.css('backgroundColor'), 'rgba(0, 0, 0, 0)', 'Initial state, no color');

	var jqcp = $input.colorpicker({
		altField: $altfield
	});

	equal($altfield.css('backgroundColor'), 'rgba(0, 0, 0, 0)', 'After creation, no color');

	jqcp.colorpicker('open');

	equal($altfield.css('backgroundColor'), 'rgba(0, 0, 0, 0)', 'After open, no color');

	jqcp.colorpicker('close');

	equal($altfield.css('backgroundColor'), 'rgba(0, 0, 0, 0)', 'After close, no color');
});

asyncTest("Changing the color in input should trigger a 'change' event on the input", function() {
	expect(1);

	var $input = $('<input type="text" value=""/>').appendTo("#qunit-fixture");

	$input.change(function() {
		ok(true, 'triggered');
		start();
	});

	var jqcp = $input.colorpicker();

	jqcp.colorpicker('setColor', 'red');
});