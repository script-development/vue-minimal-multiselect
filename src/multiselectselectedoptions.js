export default {
    name: 'multiselect_selectedoptions',
    props: {
        options: {
            type: Array,
            required: false,
            default: () => [],
        },
        selected: {
            type: Array,
            required: true,
        },
    },

    render(h) {
        const allSelectedOptions = this.selected.map(selectedOption =>
            this.options.find(option => option.id == selectedOption)
        );
        const selectedOptions = allSelectedOptions.map(option => [
            h('span', {attrs: {class: 'multiselect__tag'}}, [
                h('span', option[this.$parent.label]),
                h('i', {
                    attrs: {class: 'multiselect__tag-icon'},
                    on: {click: () => this.$parent.removeOption(option)},
                }),
            ]),
        ]);

        if (this.options.length) {
            return h('div', {attrs: {class: 'multiselect__tags'}}, [
                h('div', {attrs: {class: 'multiselect__tags-wrap'}}, selectedOptions),
            ]);
        }
        return;
    },
};
