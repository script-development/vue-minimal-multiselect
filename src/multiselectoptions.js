export default {
    name: 'multiselectoptions',
    props: {
        options: {
            type: Array,
            required: true,
        },
    },
    render(h) {
        let renderedOptions = this.options.sort().map(option =>
            h(
                'li',
                {
                    attrs: {class: 'multiselect__element', style: 'cursor: pointer'},
                    on: {click: () => this.$parent.selectOption(option)},
                },
                [
                    h(
                        'span',
                        {
                            attrs: {
                                class: 'multiselect__option',
                            },
                        },
                        option.name
                    ),
                ]
            )
        );

        if (this.$parent.dropDownEnabled && this.$parent.filteredOptions.length) {
            return h(
                'div',
                {
                    attrs: {
                        class: 'multiselect__content-wrapper',
                        style: 'max-height: 200px;',
                    },
                },
                [
                    h(
                        'ul',
                        {
                            attrs: {
                                class: 'multiselect__content',
                                style: 'display: inline-block;',
                            },
                        },
                        renderedOptions
                    ),
                ]
            );
        }

        if (this.$parent.dropDownEnabled && !this.$parent.filteredOptions.length) {
            return h(
                'div',
                {
                    attrs: {
                        class: 'multiselect__content-wrapper',
                        style: 'max-height: 200px;',
                    },
                },
                [
                    h(
                        'div',
                        {
                            attrs: {
                                class: 'multiselect__content',
                                style: 'display: inline-block;',
                            },
                        },
                        [h('span', [this.$parent.noResults])]
                    ),
                ]
            );
        }
    },
};
