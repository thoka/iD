iD.ui.preset.mcombo =
iD.ui.preset.typeMCombo = function(field, context) {
    var event = d3.dispatch('change'),
        optstrings = field.strings && field.strings.options,
        optarray = field.options,
        strings = {},
        input;

    function mcombo(selection) {
        // console.log("!mcombo");
        input = selection.selectAll('select').data([0]);

        var enter = input.enter()
            .append('select')
            .attr('multiple','multiple')
            .attr('id', 'preset-input-' + field.id);

        var combobox = $("#preset-input-"+field.id);

        if (optstrings) { enter.attr('readonly', 'readonly'); }

        input
            //.call(combobox)
            .on('change', change)
            .on('blur', change)
            .each(function() {
                if (optstrings) {
                    _.each(optstrings, function(v, k) {
                        strings[k] = field.t('options.' + k, { 'default': v });
                    });
                    stringsLoaded();
                } else if (optarray) {
                    _.each(optarray, function(k) {
                        strings[k] = k.replace(/_+/g, ' ');
                    });
                    stringsLoaded();
                } else if (context.taginfo()) {
                    context.taginfo().values({key: field.key}, function(err, data) {
                        if (!err) {
                            _.each(_.pluck(data, 'value'), function(k) {
                                strings[k] = k.replace(/_+/g, ' ');
                            });
                            stringsLoaded();
                        }
                    });
                }
            });

        function stringsLoaded() {
            // console.log("!stringsLoaded");
            var keys = _.keys(strings),
                strs = [],
                placeholders;

            var data=keys.map(function(k) {
                var s = strings[k],
                    o = {};
                o.title = o.value = s;
                if (s.length < 20) { strs.push(s); }
                return o;
            });

            placeholders = strs.length > 1 ? strs : keys;
           
            $.each(keys, function (i, o) {
                combobox.append("<option>" + o + "</option>");
            });

            /* 
            console.log("cbox",combobox);      
            console.log("keys",keys);
            console.log("data",data);
            */

            combobox.on("blur",function() {
                console.log("combobox blur");
                change();
            }).on("change",function() {
                console.log("combobox changed");
                change();
            });


            var display_text = 
                field.placeholder() || 
                (placeholders.slice(0, 3).join(', ') + '...');


            combobox.SumoSelect({ 
                placeholder : display_text,
                csvDispCount : 0 
            });

            // input.attr('placeholder', display_text );
            //$(".SlectBox .placeholder").text( display_text );

        }

        function change() {
            console.log("!change");
            var optstring = _.find(_.keys(strings), function(k) { return strings[k] === input.value(); }),
                value = 
                    optstring || (combobox
                        .val()
                        .map(function(s) { return s.trim(); })
                        .join(';')
                        .replace(/\s+/g, '_'));

            // if (field.type === 'typeMCombo' && !value) value = 'yes';

            var t = {};
            t[field.key] = value || undefined;
            event.change(t);
        }

    }

    mcombo.tags = function(tags) {
        var key = tags[field.key],
            value = strings[key] || key || '';
        if (field.type === 'typeCombo' && value.toLowerCase() === 'yes') value = '';
        input.value(value);
    };

    mcombo.focus = function() {
        input.node().focus();
    };

    return d3.rebind(mcombo, event, 'on');
};
