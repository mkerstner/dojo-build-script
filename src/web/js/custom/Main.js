
/**
 * Main.js
 * 
 ***@author Matthias Kerstner <matthias@kerstner.at> 
 */

dojo.requireLocalization('avw', 'Main');

dojo.require("dojo.hash");

dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.NumberTextBox");

dojo.require("avw.Preloader");

dojo.provide("avw.Main");
dojo.declare("avw.Main", null, {

    /**
     *
     */
    _task_editor_window : null,

    _localization : null,

    _localization_preloader : null,
  
    /**
     * Closes the task editor window if it is opened.
     */
    _closeTaskWindow : function() {
        if(this._task_editor_window && !this._task_editor_window.closed) {
            this._task_editor_window.close();
        }
    },

    /**
     * @param <int?> defaultContractorId
     */
    constructor: function(defaultContractorId) {
        try {
            this._localization = dojo.i18n.getLocalization('avw', 'Main');
            this._localization_preloader = dojo.i18n.getLocalization('avw', 'Preloader');

            var dfd = new dojo.Deferred();
            dfd.addCallback(dojo.partial(dojo.hitch(this, 'init'),
                defaultContractorId));
            dfd.addErrback(function(error) {

                dojo.byId('preloaderInner').innerHTML +=
                '<span style="color:red; font-weight:bold;">' +
                this._localization_preloader.FAILED + '</span>';

                if(typeof _AVW_DEBUG_MODE_ !== 'undefined') {
                    console.error(error.message);
                } else {
                    window.location = '?mod=logout&error=3&errorMsg='+error.message;
                }
                return error;
            });
            dfd.callback(true);
        } catch(exc) {
            alert(exc.description);
        }
    },
  
    /**
     * Initializes required modules.
     * @return <object> dojo.Deferred
     */
    init : function() {

        var dfd = new dojo.Deferred();

        var loadModuleUpdateMsg = function(moduleName, rsp) {
            dojo.byId('preloaderInner').innerHTML += '<br/>&nbsp;&nbsp;' +
            this._localization_preloader.LOADING_MODULE + ' ' + moduleName + '...';
            return rsp;
        };
        var finishedUpdateMsg = function(rsp) {
            dojo.byId('preloaderInner').innerHTML += ' ' +
            this._localization_preloader.DONE + '!';
            return rsp;
        };

        dfd.addCallback(dojo.hitch(this, function(rsp) {
            dojo.byId('preloaderInner').innerHTML += '<br/>&nbsp;&nbsp;' +
            this._localization_preloader.PARSING_WIDGETS + '...';
            dojo.parser.parse();
            dojo.byId('preloaderInner').innerHTML +=  ' ' +
            this._localization_preloader.DONE + '!';
            return rsp;
        }));

        if(typeof SMS !== 'undefined') {
            SMS = new avw.Sms(); //cannot be initialized async...
            dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'task'));
            dfd.addCallback(dojo.hitch(SMS, 'init'));
            dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));
        }

        if(typeof STAT !== 'undefined') {
            STAT_T = new avw.StatisticsTask();
            dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'statistics task'));
            dfd.addCallback(dojo.hitch(STAT_T, 'init'));
            dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));

            STAT_TO = new avw.StatisticsTurnover();
            dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'statistics turnover'));
            dfd.addCallback(dojo.hitch(STAT_TO, 'init'));
            dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));

            STAT_E = new avw.StatisticsEmployee();
            dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'statistics employee'));
            dfd.addCallback(dojo.hitch(STAT_E, 'init'));
            dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));
            
            STAT_B = new avw.StatisticsBmd();
            dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'statistics bmd'));
            dfd.addCallback(dojo.hitch(STAT_B, 'init'));
            dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));
        }
        
        T = new avw.Task(); //cannot be initialized async...
        dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'task'));
        dfd.addCallback(dojo.hitch(T, 'init'));
        dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));

        TLS = new avw.TaskLiveStatus(); //cannot be initialized async...
        dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'task status'));
        dfd.addCallback(dojo.hitch(TLS, 'init'));
        dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));

        C = new avw.Customer(); //cannot be initialized async...
        dfd.addCallback(dojo.hitch(this, loadModuleUpdateMsg, 'customer'));
        dfd.addCallback(dojo.hitch(C, 'init'));
        dfd.addCallback(dojo.hitch(this, finishedUpdateMsg));

        dfd.addCallback(dojo.hitch(this, function(rsp) { //final init stuff            
            dojo.connect(dijit.byId('mainLoadTaskForm'), 'onSubmit',
                dojo.hitch(this, 'loadTask'));

            dojo.byId('preloaderInner').innerHTML += '<br/>'+
            this._localization_preloader.DONE.toUpperCase() + '! - ' +
            this._localization_preloader.STARTING_GUI + '...';

            setTimeout('avw.Preloader.hide()', 1000);

            return rsp;
        }));

        dfd.callback(true); //start chain

        return dfd; //for further chaining
    },

    /**
     * Opens task in new window. Can either be called directly using taskId or
     * by using the event-object during an onSubmit-call.
     * @param <Object> event generated by onSubmit if used in <form>
     * @param <int> taskId used for direct calls
     */
    loadTask : function(event, taskId) {
        
        var taskIdToLoad = null;
        var taskUrlToLoad = '';
        
        if(event) { //onSubmit event triggered by <form>-submit
            event.preventDefault(); //stop double post
            
            if(!dijit.byId('mainOpenTask').isValid() ||
                !dijit.byId('mainOpenTask').attr('value')) {
                alert('Bitte geben Sie eine gültige Auftragsnummer an.');
                return;
            }
            taskIdToLoad = parseInt(dijit.byId('mainOpenTask').attr('value'));
        } else { //direct call
            if(!taskId) {
                alert('Bitte geben Sie eine gültige Auftragsnummer an.');
                return;
            }
            taskIdToLoad = parseInt(taskId);
        }

        taskUrlToLoad = '?mod=task_editor&taskId='+taskIdToLoad;

        /**
         * check if task is already opened in task editor window. If so, focus
         * task editor without refresh.
         */
        if(this._task_editor_window != null && !this._task_editor_window.closed) {
            var taskUrlToLoadQuery = new RegExp(taskUrlToLoad.replace(
                new RegExp("\\?", "g"), "\\?"));

            if(this._task_editor_window.location.href.match(taskUrlToLoadQuery)) {
                this._task_editor_window.focus(); //try to get focus
                alert('Dieser Auftrag ist bereits in einem anderen Fenster geöffnet.');
                return;
            } //otherwise reload/open task editor with new task
        }

        var dfdOpenWindow = function(rsp) { //open task editor window
            this._task_editor_window = window.open(taskUrlToLoad, 'taskEditor');
            this._task_editor_window.focus();
            return rsp;
        }

        var eb = dojo.partial(avw.Utils.eb);
        var dfd = new dojo.Deferred();
        dfd.addCallbacks(dojo.partial(avw.Utils.debug, 'Laden', true), eb).
        addCallback(avw.Utils.dfd('post', '?mod=task&rct=json', 'json', 1, {
            taskId:parseInt(taskIdToLoad)
        })).
        addCallbacks(dojo.hitch(this, dfdOpenWindow), eb).
        addBoth(dojo.partial(avw.Utils.debug, 'Bereit', false));
        dfd.callback(true); 
    },
    
    /**
     *
     */
    logout : function() {
        window.location = '?mod=logout'; //automatically calls close()
    },
  
    /**
     * Checks if window was refreshed or window was closed. Automatically logs
     * out user if window was closed.
     */
    close : function() {

        //closing the task editor window does not work (at least with Firefox).
        //So leave it open, as the session will be closed from the main window
        //anyways...

        var w = window.open('', 'logout', 'height=100,width=230,location=no,'+
            'toolbar=no,menubar=no,resizable=no,status=no');
    
        if(!w) {
            alert('Sie konnten nicht abgemeldet werden, da Ihr Browser Popups verhindert.');
            return;
        }
    
        var c = '<html><head><script>'+
        'function c() {'+
        'if(!window.opener || window.opener.closed) {'+
        '  document.getElementById("closeMsg").innerHTML = '+
        '  "<img src=\'/img/icon_loading.gif\' />Sie werden abgemeldet - '+
        '   <br/>Bitte warten...";'+
        '   <img src=\'?mod=logout\' width=\'1\' height=\'1\' />'+
        '} else'+
        '  document.getElementById("closeMsg").innerHTML = '+
        '  "<img src=\'/img/icon_loading.gif\' />Applikation wird neu geladen - '+
        '   <br/>Bitte warten...";'+
        '  setTimeout("self.close()", 1000);}'+
        '</script></head><body onload="c();self.focus();">'+
        '<span id="closeMsg" style="font:9pt Courier New;"></span>'+
        '</body></html>';
    
        w.document.write(c);
        w.document.close();
    },

    /**
     * 
     */
    loadBillPdf : function(billId) {
        var wOptions = 'width=100,height=100,location=false,menubar=false,status=false';
        var url = '?mod=task_bill&cmd=10&billId='+parseInt(billId);

        if(!window.open(url, 'Druckverschau', wOptions))
            return new Error('Failed to open print window.');
    }
});
