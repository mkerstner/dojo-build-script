/**
 * @filesource custom.profile.js
 *
 * Profile used for deploying custom Dojo layers.
 *
 * Usage:
 * 
 * lib/js/util/buildscripts/build.sh profileFile=path/to/scripts/avw.profile.js
 * action=release cssOptimize=comments optimize=shrinkSafe releaseName=
 *
 * Requires the COPYRIGHT file in the root path of this project.
 * 
 * @author Matthias Kerstner <matthias@kerstner.at>
 */

dependencies = {
    layers: [
    {
        // one of the stock layers. It builds a "roll up" for
        // dijit.dijit which includes most of the infrastructure needed to
        // build widgets in a single file. We explicitly ignore the string
        // stuff via the previous exclude layer.
        name: "../dijit/dijit.js",
        // what the module's name will be, i.e., what gets generated
        // for dojo.provide(<name here>);
        resourceName: "dijit.dijit",
        // modules *not* to include code for
        layerDependencies: ["string.discard"],
        // modules to use as the "source" for this layer
        dependencies: ["dijit.dijit"]
    },
    {
        name: "../custom/layerLogin.js",
        dependencies: ["custom.layerLogin"],
        copyrightFile: "../../../../COPYRIGHT"
    },
    {
        name: "../custom/layerOther.js",
        dependencies: ["custom.layerOther"],
        copyrightFile: "../../../../COPYRIGHT"
    }],
    prefixes: [
    ["dijit", "../dijit"],
    ["dojox", "../dojox"],
    // include COPYRIGHT
    ["custom", "../custom", "../../../../COPYRIGHT"]
    ]
}