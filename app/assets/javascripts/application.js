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
          format: '%Y-%m-%d'
        }
      }
    },
    point: {
      show: false
    }
  });

  var addRepo = function(){
    var repoName = $('#repo-input').val()

    if(repoName.search(/[A-z]+\/[A-z]+/) == -1){
      alert("Please specify correct repo name format")
      return false;
    }

    $.getJSON("/" + repoName, function(resp){
      counts = calculateCumulativeCounts(resp)
      chart.load({
        columns: [
          ['x'].concat(_.keys(counts)),
          [repoName].concat(_.values(counts))
        ]
      })
    }).fail(function(resp){
      if(resp.responseJSON.error)
        alert(resp.responseJSON.error)
    })

    return false;
  }

  $(document).on('click', '.add-repo', addRepo);
  $("#add-repo-form").submit(addRepo);

});

