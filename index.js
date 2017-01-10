var express = require('express');
var app = express();
var net = require('net');
var os = require("os");
var startMeasure = cpuAverage();

app.get('/getCPUUsage', function (req, res) {
    var endMeasure = cpuAverage();
    //Calculate the difference in idle and total time between the measures
    var idleDifference = endMeasure.idle - startMeasure.idle;
    var totalDifference = endMeasure.total - startMeasure.total;

    //Calculate the average percentage CPU usage
    var percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);

    var data = {
        'type': 'CPU',
        'usage': percentageCPU
    };
    res.send(data);
});

app.get('/getMem', function (req, res) {
    var data = {
        'type': 'mem',
        'totalmem': (os.totalmem() / 1024) / 1024,
        'freemem': (os.freemem() / 1024) / 1024,
        'usedmem': Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)
    };
    res.send(data);
});

app.get('/getTemp', function (req, res) {
    var exec = require('child_process').exec;
    exec('vcgencmd measure_temp', function callback(error, stdout, stderr) {
        var currentTemp = stdout.replace('temp=', '').replace('\'C', '');
        var data = {
            'type': 'temp',
            'temp': parseInt(currentTemp)
        }
        res.send(data);
    });
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});

function cpuAverage() {

    //Initialise sum of idle and time of cores and fetch CPU info
    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();

    //Loop through CPU cores
    for (var i = 0, len = cpus.length; i < len; i++) {

        //Select CPU core
        var cpu = cpus[i];

        //Total up the time in the cores tick
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }

        //Total up the idle time of the core
        totalIdle += cpu.times.idle;
    }

    //Return the average Idle and Tick times
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}