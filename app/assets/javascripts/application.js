// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require foundation
//= require turbolinks
//= require lodash
//= require d3
//= require c3
//= require alerts
//= require_tree .


$(function(){
  $(document).foundation();

  var calculateCumulativeCounts = function(data) {
    var i = 0;
    var count = _.keys(data).length

    var cumulativeTotals = _(data)
      .map(function(a, b){
        i += a
        return [b, i];
      })
      .groupBy(function(value, index){
        return Math.floor(index / (count / 100))
      })
      .map(function(a, b){
        return _.last(a)
      })

    return _.object(cumulativeTotals.value())
  }

  var chart = c3.generate({
    bindTo: "#chart",
    data: {
      x: 'x',
      columns: []
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          fit: false,
          format: '%Y-%m-%d'
        }
      }
    },
    point: {
      show: false
    },
    tooltip: {
      show: false
    }
  });

  var addRepo = function(repoName) {
    $.getJSON("/" + repoName.replace(".", "=="), function(resp){
      counts = calculateCumulativeCounts(resp)
      chart.load({
        columns: [
          ['x'].concat(_.keys(counts)),
          [repoName].concat(_.values(counts))
        ]
      })
    }).fail(function(resp){
      if(resp.responseJSON.error)
        alertify.alert(resp.responseJSON.error)
    })
  }

  var addRepoFromInput = function(){
    var repoName = $('#repo-input').val()

    if(repoName.search(/[\w\.]+\/[\w\.]+/) == -1){
      alertify.alert("Please specify correct repo name format 'user_name/repo_name' ")
      return false;
    }

    addRepo(repoName)

    return false;
  }

  var addRepoFromRepoList = function(evt){
    repoName = evt.target.href.match(/github.com\/([\w\.\/-]+)/)[1]
    addRepo(repoName)
    return false
  }

  $(document).on('click', '.add-repo', addRepoFromInput);
  $("#add-repo-form").submit(addRepoFromInput);
  $(document).on('click', '.repo-list a', addRepoFromRepoList)
});

