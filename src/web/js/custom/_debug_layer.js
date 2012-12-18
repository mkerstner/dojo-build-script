
/**
 * @file _debug_layer.js
 * @author Matthias Kerstner <matthias@kerstner.at>
 *
 * This file emulates AVWOnline's Dojo-layers for debugging purposes. Be sure to
 * include this file in the HTML header section to enable debugging without the
 * need to built Dojo's layers everytime the client-side JS code is changed.
 *
 * NOTE: This file only provides support for basic i18n -> be sure to set the
 * browser's locale to basic "de" or "en" for instance, as Dojo's parser will
 * try to load the browser's specific locale (e.g. "de-at") and in case this
 * localization does not exist will fail and terminate.
 */

var _AVW_DEBUG_MODE_ = true;

//layer login
dojo.require("dojo.i18n");
dojo.require("avw.Login");

//layer main
dojo.require("avw.Main");
dojo.require("avw.Help");
dojo.require("avw.Task");
dojo.require("avw.TaskLiveStatus");
dojo.require("avw.Customer");
dojo.require("avw.Statistics");
dojo.require("avw.DecodeQueryReadStore");
dojo.require("avw.Sms");

//layer task editor
dojo.require("avw.TaskEditor");
