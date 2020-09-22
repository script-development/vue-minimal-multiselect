import 'jsdom-global/register';
import assert from 'assert';
import {shallowMount} from '@vue/test-utils';
import Multiselect from '../src';
import crypto from 'crypto';
// import sinon from '../node_modules/sinon/pkg/sinon-esm.js';
import sinon from 'sinon';

const generateRandomString = len => crypto.randomBytes(len).toString('hex');

const getAmountOfOptions = amount =>
    [...Array(amount).keys()].map(index => ({id: index + 1, name: generateRandomString(10)}));

describe('Vue minimal select', () => {
    describe('computed properties', () => {
        describe('filtered options', () => {
            it('should filter out selected options', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [1],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                        ],
                    },
                });
                assert.deepStrictEqual(wrapper.vm.filteredOptions, [{id: 2, name: 'Sjaak'}]);
            });

            it('should filter on search', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                        ],
                    },
                });
                wrapper.setData({findOption: 'ha'});

                assert.deepStrictEqual(wrapper.vm.filteredOptions, [{id: 1, name: 'Harry'}]);
            });

            it('should filter on search and filter out selected', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [1],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                            {id: 3, name: 'Kees'},
                        ],
                    },
                });
                wrapper.setData({findOption: 'a'});

                assert.deepStrictEqual(wrapper.vm.filteredOptions, [{id: 2, name: 'Sjaak'}]);
            });

            it('should return options when nothing is selected and nothing is searched', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                            {id: 3, name: 'Kees'},
                        ],
                    },
                });

                assert.deepStrictEqual(wrapper.vm.filteredOptions, [
                    {id: 1, name: 'Harry'},
                    {id: 2, name: 'Sjaak'},
                    {id: 3, name: 'Kees'},
                ]);
            });

            it('should return not more than optionsLimit', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(20),
                        optionsLimit: 2,
                    },
                });

                assert.strictEqual(wrapper.vm.filteredOptions.length, 2);
            });

            it('should return not more than optionsLimit when searching', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                            {id: 3, name: 'Kees'},
                            {id: 4, name: 'Are'},
                            {id: 5, name: 'Ter'},
                            {id: 6, name: 'Asd'},
                            {id: 7, name: 'Dsa'},
                            {id: 8, name: 'Acv'},
                            {id: 9, name: 'vas'},
                            {id: 10, name: 'asg'},
                            {id: 11, name: 'asdggsdg'},
                            {id: 12, name: 'asdgsdggsd'},
                        ],
                        optionsLimit: 2,
                    },
                });

                wrapper.setData({findOption: 'a'});

                assert.strictEqual(wrapper.vm.filteredOptions.length, 2);
            });
        });
    });

    describe('methods', () => {
        describe('pick option', () => {
            it('should emit the newly selected value in an array, without any pre selected values', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.vm.pickOption({id: 4, name: 'Harry'});
                assert.deepStrictEqual(wrapper.emitted().input[0][0], [4]);
            });

            it('should emit the newly selected value in an array, with pre selected values', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [1, 2],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.vm.pickOption({id: 4, name: 'Harry'});
                assert.deepStrictEqual(wrapper.emitted().input[0][0], [1, 2, 4]);
            });

            it('should call clearDropdown method', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                const callback = sinon.spy(wrapper.vm, 'clearDropdown');

                wrapper.vm.pickOption({id: 4, name: 'Harry'});

                assert.strictEqual(callback.callCount, 1);
            });
        });

        describe('add option', () => {
            it('should not emit anything when the option is already selected', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [{name: 'Harry'}],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({findOption: 'Harry'});

                wrapper.vm.addOption();

                assert.strictEqual(Object.keys(wrapper.emitted()).length, 0);
            });

            it('should emit a create event when there is a create listeners', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                    listeners: {create: () => {}},
                });

                wrapper.setData({findOption: 'Harry'});

                wrapper.vm.addOption();

                assert.strictEqual(wrapper.emitted().create[0][0], 'Harry');
            });

            it('should emit an input event when there is no create listeners', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                    listeners: {create: undefined},
                });

                wrapper.setData({findOption: 'Harry'});

                wrapper.vm.addOption();

                assert.deepStrictEqual(wrapper.emitted().input[0][0], [{name: 'Harry'}]);
            });

            it('should call clearDropdown method', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({findOption: 'Harry'});

                const callback = sinon.spy(wrapper.vm, 'clearDropdown');

                wrapper.vm.addOption();

                assert.strictEqual(callback.callCount, 1);
            });
        });

        describe('remove option', () => {
            it('should emit input event without removed value', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [1, 2, 3],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.vm.removeOption(2);

                assert.deepStrictEqual(wrapper.emitted().input[0][0], [1, 3]);
            });

            it('should call clearDropdown method', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [2, 3],
                        options: getAmountOfOptions(3),
                    },
                });

                const callback = sinon.spy(wrapper.vm, 'clearDropdown');

                wrapper.vm.removeOption(2);

                assert.strictEqual(callback.callCount, 1);
            });
        });

        describe('clear dropdown', () => {
            it('should reset find option', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [2, 3],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({findOption: 'magic'});

                wrapper.vm.clearDropdown();

                assert.strictEqual(wrapper.vm.findOption, '');
            });

            it('should set drop down enabled to false', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [2, 3],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({dropDownEnabled: true});

                wrapper.vm.clearDropdown();

                assert.strictEqual(wrapper.vm.dropDownEnabled, false);
            });
        });

        describe('input enter', () => {
            it('should call add option when there are no more filtered options', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(0),
                    },
                });

                const callback = sinon.spy(wrapper.vm, 'addOption');

                wrapper.vm.inputEnter();

                assert.strictEqual(callback.callCount, 1);
            });

            it('should call pick option when there is 1 filtered options', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: [{id: 1, name: 'Kees'}],
                    },
                });

                const callback = sinon.spy(wrapper.vm, 'pickOption');

                wrapper.vm.inputEnter();

                assert(callback.calledWith({id: 1, name: 'Kees'}));
                assert.strictEqual(callback.callCount, 1);
            });

            it('should call nothing when there is more then 1 filtered options', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(5),
                    },
                });

                const callbackPick = sinon.spy(wrapper.vm, 'pickOption');
                const callbackAdd = sinon.spy(wrapper.vm, 'addOption');

                wrapper.vm.inputEnter();

                assert.strictEqual(callbackPick.callCount, 0);
                assert.strictEqual(callbackAdd.callCount, 0);
            });
        });
    });

    describe('elements', () => {
        describe('select dropdown', () => {
            it('should open dropdown when closed', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                const selectButton = wrapper.find('div.multiselect__select');
                assert.strictEqual(wrapper.vm.dropDownEnabled, false);
                selectButton.trigger('click');
                assert.strictEqual(wrapper.vm.dropDownEnabled, true);
            });

            it('should close dropdown when opened', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({dropDownEnabled: true});

                const selectButton = wrapper.find('div.multiselect__select');
                selectButton.trigger('click');
                assert.strictEqual(wrapper.vm.dropDownEnabled, false);
            });

            it('should clear search when closing', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                wrapper.setData({dropDownEnabled: true, findOption: generateRandomString(2)});

                const selectButton = wrapper.find('div.multiselect__select');
                selectButton.trigger('click');
                assert.strictEqual(wrapper.vm.findOption, '');
            });
        });

        describe('searching', () => {
            it('should update findOption when typing', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: getAmountOfOptions(3),
                    },
                });

                const searchInput = wrapper.find('input.multiselect__input');
                searchInput.setValue('123');

                assert.strictEqual(wrapper.vm.findOption, '123');
            });

            it('should call inputEnter on enter', () => {
                const wrapper = shallowMount(Multiselect, {
                    propsData: {
                        value: [],
                        options: [
                            {id: 1, name: 'Harry'},
                            {id: 2, name: 'Sjaak'},
                            {id: 3, name: 'Kees'},
                        ],
                    },
                });
                const callback = sinon.spy(wrapper.vm, 'inputEnter');

                const searchInput = wrapper.find('input.multiselect__input');
                searchInput.setValue('Klaas');

                searchInput.trigger('keypress', {keyCode: 13});

                assert.strictEqual(callback.callCount, 1);
            });
        });
    });
});
