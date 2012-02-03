/*!
 * jQuery Colorpicker Plugin
 * 
 * Copyright (c) 2011 JR Shampang, Brady Corporation
 * Licensed under MIT
 */
(function ($) {
    // 2D array for color palette.
    // Empty arrays indicate spacer row
    var COLORS = [
            ['#000000', '#363636', '#565656', '#7c7c7c', '#a4a4a4', '#c8c8c8', '#dadada', '#ffffff'],
            [],
            ['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#9900ff', '#ff00ff'],
            [],
            ['#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#cfe2f3', '#d9d2e9', '#ead1dc'],
            ['#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
            ['#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6fa8dc', '#8e7cc3', '#c27ba0'],
            ['#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3d85c6', '#674ea7', '#a64d79'],
            ['#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#0b5394', '#351c75', '#741b47'],
            ['#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#073763', '#20124d', '#4c1130']
        ],
        checkedClass = 'colorpicker-checked',                              // Palette cells marked with this class have a checkmark
        paletteClass = 'colorpicker-palette',                  // Class for the palette
        spacerClass = 'colorpicker-spacer',                    // Class used for empty rows
        triggerClass = 'colorpicker',                          // Class used for colorpicker trigger/button
        colorProperty = 'background-color',                    // CSS property used to set and get color
        onColorSelectEventName = 'colorpickerOnColorSelect',   // Name for custom event that fires when user selects a color
        onColorHoverEventName = 'colorpickerOnColorHover',     // Name for custom event that fires when user hovers over a color
        onColorOutEventName = 'colorpickerOnColorOut',         // Name for custom event that fires when user's mouse leaves a color
        namespace = 'colorpicker',                             // Namespace to use for events and data
        effect = 'fade',                                       // Effect to use when showing/hiding palette
        methods = {};                                          // Container for colorpicker methods
        
    // Hide colorpickers when user clicks elsewhere on the page
    $(document).click(function() {
        $('.' + triggerClass).colorpicker('hide');
    });
    
    // Build color palette
    function buildPalette($trigger) {        
        var palette = '<table class="' + paletteClass + '">';

        $.each(COLORS, function (i, row) { // Build each row
            if (row.length) {
                palette += '<tr>';
                $.each(row, function (j, color) { // Build each cell
                    palette += '<td style="' + colorProperty + ':' + color + '"></td>';
                });
                palette += '</tr>';
            } else { // Add spacer row for empty arrays
                palette += '<tr class="' + spacerClass + '"></tr>';
            }
        });

        palette += '</table>';

        // Add palette to page and assign events
        // Click: Assign checkmark, update picker, trigger onColorSelect event
        // MouseEnter: Get color, trigger onColorHover event
        // MouseLeave: Get trigger color, trigger onColorOut event
        var $palette = $(palette).hide().insertAfter($trigger);
        return $palette
                .find('td')
                    .bind('click.' + namespace, function() {
                        // Remove old checkmark
                        $palette.find('.' + checkedClass).removeClass(checkedClass).empty();

                        // Add new checkmark and return color val.
                        var color = $(this).addClass(checkedClass).html('&#10003;').css(colorProperty);
                        
                        // Update colorpicker button with new color and trigger event
                        $trigger
                            .css(colorProperty, color)
                            .trigger(onColorSelectEventName, [color]);

                        // User's done picking a color, so hide palette
                        $palette.hide(effect);
                    }).bind('mouseenter.' + namespace, function () {
                        // Get color that user's currently hovering over and trigger event
                        var color = $(this).css(colorProperty);
                        $trigger.trigger(onColorHoverEventName, [color]);
                    }).bind('mouseleave.' + namespace, function () {
                        // Get the current color of the trigger,
                        // and trigger the custom event.
                        var color = $trigger.css(colorProperty);
                        $trigger.trigger(onColorOutEventName, [color]);
                    })
                .end();
    }

    // Initializes the colorpicker.
    // $(elem).colorpicker();
    // or
    // var options = {color: '#000000', onColorSelect: function() {}};
    // $(elem).colorpicker(options);
    methods.init = function (options) {
        // Set default options and merge with user's options
        options = $.extend({
            color: '#ffffff',        // Initial color of colorpicker
            onColorSelect: $.noop,   // Function to run when user selects a color
            onColorHover: $.noop,    // Function to run when user hovers over a color cell
            onColorOut: $.noop       // Function to run when user's mouse leaves a color cell
        }, options);
        
        // Convert color vals to lowercase for comparing
        // against lowercase color palette values
        options.color = options.color.toLowerCase();

        return this.each(function () {
            // jQueryify this and build its palette
            var $this = $(this),
                $palette = buildPalette($this),
                data = {
                    palette: $palette
                };
            
            $this
                .addClass(triggerClass) // Make this a colorpicker button
                .data(namespace, data) // Store reference to palette
                .css(colorProperty, options.color) // Set the initial color
                .bind(onColorSelectEventName, options.onColorSelect) // Bind the user's function to onColorSelect event
                .bind(onColorHoverEventName, options.onColorHover) // Bind the user's function to onColorHover event
                .bind(onColorOutEventName, options.onColorOut) // Bind the user's function to onColorOut event
                .bind('click.' + namespace, function () {
                    if ($palette.is(':visible')) {
                        methods.hide.call($this);
                    } else {
                        methods.show.call($this);
                    }
                });
        });

    };

    // Gets or sets the color of the colorpicker
    // $(elem).colorpicker('color');
    // or
    // $(elem).colorpicker('color', '#ff0000');
    methods.color = function (color) {
        if (color) { // Set
            return this.css(colorProperty, color);
        } else { // Get
            return this.css(colorProperty);
        }
    };
    
    // Hides the colorpicker
    // $(elem).colorpicker('hide');
    methods.hide = function () {
        return this.each(function() {
            $(this).data(namespace).palette.not(':hidden').stop(true, true).hide(effect);
        });
    };

    // Shows the colorpicker
    // $(elem).colorpicker('show');
    methods.show = function () {
        return this.each(function () {
            // Get colorpicker data.
            var $this = $(this),
                height = $this.outerHeight(),
                color = $this.css(colorProperty),
                $palette = $this.data(namespace).palette,
                offset = $this.position();

            // Stop/remove previous animations and hide palette
            // Move palette under colorpicker button that was just clicked,
            // move checkmark to color matching button's value (if available),
            // and show the color palette.
            $palette
                .stop(true, true).hide()
                .css({ top: offset.top + height, left: offset.left })
                .find('.' + checkedClass).removeClass(checkedClass).end()
                .find('td')
                    .filter(function() {
                        return $(this).css(colorProperty) === color;
                    }).addClass(checkedClass)
                    .end()
                .end()
                .show(effect);
        });
    };
        
    // Hooks up colorpicker methods
    $.fn.colorpicker = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist for jQuery.colorpicker');
        }
    };

})(jQuery);