dojo.require('dijit.form.Form');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.TextBox');
 
dojo.provide('custom.Login');
dojo.declare('custom.Login', null, {
 
    /**
     * Default constructor
     */
    constructor: function() {
        this.init();
    },
 
    /**
     * Initializes Login module.
     */
    init : function() {
        dijit.byId('loginUser').focus();
    }
});