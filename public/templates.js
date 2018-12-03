(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['todoPartial'] = template({"1":function(container,depth0,helpers,partials,data) {
    return " inactive";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div>\r\n    <h3 class=\"todo-text"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.inactive : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</h3>\r\n    <p class=\"todo-sub"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.inactive : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">Weeks until to-do is active again: "
    + alias4(((helper = (helper = helpers.weeksUntilNext || (depth0 != null ? depth0.weeksUntilNext : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"weeksUntilNext","hash":{},"data":data}) : helper)))
    + "</p>\r\n    <button class=\"todo-delete\">Delete</button>\r\n</div>";
},"useData":true});
})();