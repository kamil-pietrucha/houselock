/***********************************************************************
 * App Controllers. These controllers will be called on page initialization. *
 ***********************************************************************/

myApp.controllers = {

    //Loader page
    loaderPage: function (page) {
        if (myApp.services.common.token.get()) {
            myApp.services.common.token.check();
        } else {
            if (myApp.services.common.checkCredentials()) {
                myApp.services.common.authorize();
            } else {
                myApp.services.common.redirectToLogin();
            }
        }
    },

    //Login page
    loginPage: function (page) {
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/login"]'), function (element) {
            element.onclick = function () {
                ajax.sendForm(page, myApp.services.common.authorizeSuccess, myApp.services.common.authorizeFail);
            };
        });
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/register-new-owner"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#myNavigator').pushPage('html/auth/register_owner.html');
            };
        });
    },

    registerPage: function (page) {
        page.querySelectorAll('[component="button/register"]'),
            function (element) {
                element.onclick = function () {
                    ajax.sendForm(page, myApp.services.common.authorizeSuccess, myApp.services.common.authorizeFail);
                }; //TODO make it work and properly register new user
            };
    },


    settingsPage: function (page) {
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/flat-list"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#myNavigator').pushPage('html/flat/flat_list.html');
            };
        });
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/user-info"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#myNavigator').pushPage('html/user/user_info.html');
            };
        });
    },

    //Flat list page
    flatListPage: function (page) {
        let flats = myApp.user.flats();
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-flat"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#myNavigator').pushPage('html/flat/flat_new.html');
            };
        });
        if (Object.keys(flats).length === 0) {
            myApp.services.flat.emptyList(page);
        } else {
            myApp.services.flat.list(page, flats);
        }
    },

    //Single flat page
    flatPage: function (page) {
        if (myApp.user.isLandlord()) {
            if ((page.data && Object.keys(page.data).length !== 0) || myApp.user.currentFlat() !== undefined) {
                let info = myApp.user.currentFlat() ? myApp.user.currentFlat() : page.data.element;
                myApp.services.dashboard.displayCurrentFlat(page, info);
                //todo: #display_flat
                //todo: najlepiej stworzyć funkcję w serwisach plik: dashboard.js

            } else {
                let flats = myApp.user.flats();
                myApp.services.flat.emptyFlatLandlord(page);
                myApp.services.flat.list(page, flats);
            }
        } else if (myApp.user.currentFlat() !== undefined) {
            let info = myApp.user.currentFlat();

            myApp.services.dashboard.displayCurrentFlat(info, page);

            myApp.services.dashboard.editFlat(page, info)
            //todo: #edit_flat
            //todo: wewnątrz funkcji do wyświetlania mieszkania oprogramować guzik edycji
            //todo: i zapis formularza - można to ogarnąć tak jak w przypadku edycji danych użytkownika - sprawdź userPage
            let flat = ons.createElement('<div>' + info.name + '</div>');
            page.querySelector('.content').appendChild(flat);
        }
    },

    //New flat page
    newFlatPage: function (page) {
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-flat"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#addFlat').pushPage('html/flat/flat_new.html');
            };
        });
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/add-flat"]'), function (element) {
            element.onclick = function () {
                myApp.services.flat.create(page);
            };
        });
    },

    billListPage: function (page) {
        let bills = myApp.flat.bills();
        if (Object.keys(bills).length === 0) {
            myApp.services.bill.emptyList(page);
        } else {
            myApp.services.bill.list(page, bills);
        }
    },

    billPage: function (page) {
        //todo: display_bill
        //todo: edit_bill
        myApp.services.bill.fill(page, page.data.element);
    },

    usersPage: function (page) {
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/new-tenant"]'), function (element) {
            element.onclick = function () {
                document.querySelector('#myNavigator').pushPage('html/user/user_new.html');
            };
        });
        let tenants = myApp.flat.tenants();
        if (Object.keys(tenants).length === 0) {
            myApp.services.user.emptyList(page);
        } else {
            myApp.services.user.list(page, tenants);
        }
    },

    //User info page
    userPage: function (page) {
        myApp.services.user.fill(page);

        Array.prototype.forEach.call(page.querySelectorAll('[component="button/logout"]'), function (element) {
            element.onclick = function () {
                myApp.services.common.redirectToLogin();
            };
        });
    },

    tenantPage: function (page) {
        let info = page.data.element;
        myApp.services.user.fill(page, info);
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/remove-tenant"]'), function (element) {
            element.onclick = function () {
                //todo: nie pokazuje się po raz kolejny
                document.getElementById('removeTenant').show();
            };
        });
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/delete-tenant"]'), function (element) {
            element.onclick = function () {
                document.getElementById('removeTenant').hide();
                ajax.send('post', '/api/user/' + info.id + '/remove', {}, myApp.services.common.updateFlat);
            };
        });
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/cancel"]'), function (element) {
            element.onclick = function () {
                document.getElementById('removeTenant').hide();
            };
        });
    },

    tenantNewPage: function (page) {
        form = $(page.querySelector('form'));
        let action = form.attr('data-ajax').replace('{id}', myApp.user.currentFlatId());
        form.attr('data-ajax', action);
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/save"]'), function (element) {
            element.onclick = function () {
                myApp.services.common.save(page, myApp.services.common.updateFlat);
            };
        });
    },

    dashboardPage: function (page) {
        let lastBill = myApp.flat.bill();
        if (Object.keys(lastBill).length === 0) {
            myApp.services.dashboard.noLastBill(page);
        } else {
            myApp.services.bill.fill(page, lastBill);
        }
    },

    userNoFlatPage: function (page) {
        Array.prototype.forEach.call(page.querySelectorAll('[component="button/logout"]'), function (element) {
            element.onclick = function () {
                myApp.services.common.redirectToLogin();
            };
        });
    },

    userAcceptPage: function (page) {
        let flatInfo = myApp.flat.currentFlat();
        let flat_number = flatInfo.flat_number ? '/' + flatInfo.flat_number : '';
        let flat = ons.createElement(
            '<div>' +
            '<ons-list-item>Ulica i numer: ' + flatInfo.street + ' ' + flatInfo.building_number + flat_number + '</ons-list-item>' +
            '<ons-list-item>Miasto: ' + flatInfo.city + '</ons-list-item>' +
            '</div>'
        );

        page.querySelector('.flat_info').appendChild(flat);

        Array.prototype.forEach.call(page.querySelectorAll('[component="button/accept"]'), function (element) {
            element.onclick = function () {
                myApp.services.user.accept();
            };
        });

        Array.prototype.forEach.call(page.querySelectorAll('[component="button/ignore"]'), function (element) {
            element.onclick = function () {
                myApp.services.user.ignore();
            };
        });

    }
};