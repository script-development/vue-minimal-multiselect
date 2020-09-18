export default {
    name: 'multiselect_searchfield',
    props: {
        placeholder: '',
    },

    render(h) {
        return h('b-row', {on: {blur: () => this.$parent.toggleDropdown}}, [
            h('b-col', [
                h('div', {attrs: {class: 'multiselect__tags'}}, [
                    h(
                        'b-form-input',
                        {
                            on: {
                                input: value => {
                                    this.$parent.findOption = value;
                                },
                                click: this.$parent.toggleDropdown,
                                keypress: event => {
                                    if (event.charCode == 13) {
                                        // charCode 13 is enter key
                                        event.preventDefault();
                                        this.$parent.addOption();
                                    }
                                },
                            },
                            attrs: {
                                placeholder: this.placeholder,
                                id: 'searchField',
                                class: 'multiselect__input',
                            },
                        },
                        h('div', {attrs: {class: 'multiselect__select'}})
                    ),
                ]),
            ]),
        ]);
    },
};
