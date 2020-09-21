/**
 * @typedef {import('vue').CreateElement} CreateElement
 */

export default {
    name: 'minimal-multiselect',
    props: {
        valueField: {
            type: String,
            required: false,
            default: 'id',
        },
        textField: {
            type: String,
            required: false,
            default: 'name',
        },
        options: {
            type: Array,
            required: true,
        },
        placeholder: {
            type: String,
            required: false,
        },
        value: {
            type: Array,
            required: true,
        },
        noResults: {
            type: String,
            required: false,
            default: 'Option not found, press enter to add',
        },
        optionsLimit: {
            type: Number,
            default: 1000,
        },
    },
    data() {
        return {
            findOption: '',
            dropDownEnabled: false,
        };
    },
    computed: {
        filteredOptions() {
            const selectedAmount = this.value.length;

            console.log('filtering');
            if (!this.findOption && !selectedAmount) return this.options.slice(0, this.optionsLimit);

            const search = this.findOption.toLowerCase();

            // TODO :: why does this not work fast when selecting?
            // const options = new Array(this.optionsLimit);
            console.time('for');
            // const options = Array(this.optionsLimit);
            const options = [];
            const optionLength = this.options.length;
            console.log(optionLength);

            // let fillIndex = 0;
            for (let index = 0; index < optionLength; index++) {
                // console.log(index);
                // if (index > this.optionsLimit) break;
                if (options.length > this.optionsLimit) break;
                const option = this.options[index];
                // if (search && option[this.textField].toLowerCase().indexOf(search) === -1) continue;
                // if (selectedAmount && this.value.indexOf(option[this.valueField]) !== -1) continue;
                options.push(option);
                // options[fillIndex] = option[this.textField];
                // fillIndex++;
            }
            console.timeEnd('for');

            // return options;
            console.time('filter');
            const Ooptions = this.options
                .filter(option => {
                    if (search && option[this.textField].toLowerCase().indexOf(search) === -1) return false;
                    if (selectedAmount && this.value.indexOf(option[this.valueField]) !== -1) return false;
                    return true;
                })
                .slice(0, this.optionsLimit);
            console.timeEnd('filter');

            console.log(Ooptions);
            // return Ooptions;

            console.time('reduce');
            const Roptions = this.options.reduce((acc, option) => {
                if (acc.length > this.optionsLimit) return acc;
                if (search && option[this.textField].toLowerCase().indexOf(search) === -1) return acc;
                if (selectedAmount && this.value.indexOf(option[this.valueField]) !== -1) return acc;
                acc.push(option);
                return acc;
            }, []);
            console.timeEnd('reduce');

            return Roptions;
        },
    },
    methods: {
        // pickOption(optionText) {
        //     const selectedOption = this.options.find(option => option[this.textField] === optionText);
        //     this.$emit('input', [...this.value, selectedOption[this.valueField]]);
        pickOption(option) {
            this.$emit('input', [...this.value, option[this.valueField]]);
            this.clearDropdown();
        },
        addOption() {
            // If the option is already added, don't add it again
            if (this.value.findIndex(option => option[this.textField] === this.findOption) !== -1) return;

            if (this.$listeners.create) return this.$emit('create', this.findOption);

            this.$emit('input', [...this.value, {[this.textField]: this.findOption}]);
            this.clearDropdown();
        },
        removeOption(optionValue) {
            this.$emit(
                'input',
                this.value.filter(value => value !== optionValue)
            );
            this.clearDropdown();
        },
        clearDropdown() {
            this.dropDownEnabled = false;
            this.findOption = '';
        },
        inputEnter() {
            const filteredOptionsLength = this.filteredOptions.length;

            if (!filteredOptionsLength) return this.addOption();
            if (filteredOptionsLength === 1) return this.pickOption(this.filteredOptions[0]);
        },
    },

    /** @param {CreateElement} h */
    render(h) {
        const select = h('div', {
            class: 'multiselect__select',
            on: {
                click: () => {
                    if (this.dropDownEnabled) return this.clearDropdown();
                    this.dropDownEnabled = true;
                },
            },
        });

        const tagsWrap = h('div', {class: 'multiselect__tags-wrap'}, [
            this.value.map(optionValue => {
                const option = this.options.find(option => option[this.valueField] === optionValue);
                const optionText = option ? option[this.textField] : optionValue[this.textField];

                // using optionText as key, big assumption that those are unique
                return h('span', {class: 'multiselect__tag', key: optionText}, [
                    h('span', [optionText]),
                    h('i', {
                        class: 'multiselect__tag-icon',
                        attrs: {'aria-hidden': 'true'},
                        on: {
                            mousedown: () => this.removeOption(optionValue),
                        },
                    }),
                ]);
            }),
        ]);

        const searchField = h('input', {
            class: 'multiselect__input',
            attrs: {
                placeholder: this.placeholder,
                value: this.findOption,
                style: this.dropDownEnabled ? 'width:100%;' : 'width: 0px; position:absolute; padding:0px;',
            },
            on: {
                input: event => (this.findOption = event.target.value),
                keypress: event => {
                    if (event.charCode == 13) {
                        // charCode 13 is enter key
                        event.preventDefault();
                        this.inputEnter();
                    }
                },
            },
        });

        if (this.dropDownEnabled) {
            this.$nextTick(() => {
                // TODO :: find a way to make this work gracefully
                if (!this.findOption) searchField.elm.value = '';
                // TODO :: find a way to focus only on opening
                searchField.elm.focus();
            });
        }

        const tagChildren = [tagsWrap, searchField];

        if (!this.dropDownEnabled && !this.value.length) {
            tagChildren.push(h('span', {class: 'multiselect__placeholder'}, [this.placeholder]));
        }

        const tags = h(
            'div',
            {
                class: 'multiselect__tags',
                on: {
                    click: () => (this.dropDownEnabled = true),
                    focusout: () => {
                        // TODO :: this does not work, should focus or blur somewhere else
                        setTimeout(this.clearDropdown, 200);
                    },
                },
            },
            tagChildren
        );

        const optionItems = this.filteredOptions.map(option =>
            h(
                'li',
                {
                    class: 'multiselect__element',
                    key: option[this.valueField],
                    // attrs: {style: 'cursor: pointer;'},
                    on: {click: () => this.pickOption(option)},
                },
                [h('span', {class: 'multiselect__option'}, [option[this.textField]])]
            )
        );
        optionItems.push(
            h(
                'li',
                {
                    attrs: {
                        style: this.filteredOptions.length || !this.findOption ? 'display:none;' : 'cursor: pointer;',
                    },
                    on: {click: () => this.addOption()},
                },
                [h('span', {class: 'multiselect__option'}, [this.noResults])]
            )
        );

        const options = h('ul', {class: 'multiselect__content', attrs: {style: 'display:inline-block'}}, optionItems);

        const optionsWrapper = h(
            'div',
            {
                class: 'multiselect__content-wrapper',
                attrs: {
                    style: this.dropDownEnabled ? 'max-height: 300px;' : 'max-height: 300px; display:none;',
                },
            },
            [options]
        );

        const children = [select, tags, optionsWrapper];

        const minimalMultiselect = h(
            'div',
            {
                class: this.dropDownEnabled ? 'multiselect multiselect--active' : 'multiselect',
            },
            children
        );

        return minimalMultiselect;
    },
};
