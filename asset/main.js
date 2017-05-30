$(function () {


    $.getJSON('data/onemax.json', function (data) {
        var dataPlot = data['3d']['data'];
        var layout = {
            autosize: true,
            scene: {
                aspectratio: {
                    x: 0.60,
                    y: 0.60,
                    z: 0.60
                },
                camera: {
                    center: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    eye: {
                        x: 0.60,
                        y: 0.60,
                        z: 0.60
                    },
                    up: {
                        x: 0,
                        y: 0,
                        z: 1
                    }
                },
                xaxis: {
                    range: axisRange(dataPlot, 'x'),
                    title: 'X',
                    type: 'linear',
                    zeroline: false
                },
                yaxis: {
                    range: axisRange(dataPlot, 'y'),
                    title: 'Y',
                    type: 'linear',
                    zeroline: false
                },
                zaxis: {
                    range: axisRange(dataPlot, 'z'),
                    title: 'Z',
                    type: 'linear',
                    zeroline: false
                }
            },
            title: 'Visualization',
            height: 710,
            width: 900
        };
        var dataExample = [{
            x: [1000, 1000, 1000],
            y: [1000, 1000, 1000],
            z: [1000, 1000, 1000],
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                color: 'rgb(23, 190, 207)',
                size: 2
            }
        }];
        var chart = Plotly.newPlot('simple-plot', [], layout);


        var chart2 = Plotly.newPlot('progress-plot', [], layout);

        for (let i = 0; i < dataPlot.length; i++) {
            let newData = createData(dataPlot[i], {size: 4}, 'Generation ' + (i + 1), false);
            Plotly.addTraces('progress-plot', newData);
        }

        initializeSlider(data);

    });
});


Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

function initializeSlider(data) {
    var dataPlot = data['3d']['data'];
    let commonOptions = {
        start: 1,
        step: 1,
        tooltips: true,
        format: wNumb({
            decimals: 0
        }),
        range: {
            min: 1,
            max: data['extra']['NGEN']
        }
    };
    var simpleSlider = document.getElementById('simple-slider');
    noUiSlider.create(simpleSlider, commonOptions);

    simpleSlider.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        let data = createData(dataPlot[i], null, 'Generation ' + (i + 1));
        if (document.getElementById('simple-plot').data.length > 0) {
            Plotly.deleteTraces('simple-plot', [0, 1]);
            // Plotly.deleteTraces('simple-plot', 0);
        }
        Plotly.addTraces('simple-plot', data);
        $("#simple-slider-generation").text(i + 1);
    });
    simpleSlider.noUiSlider.set(1);

    // Progress Slider
    var progressSlider = document.getElementById('progress-slider');
    noUiSlider.create(progressSlider, commonOptions);

    progressSlider.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        var plotDiv = document.getElementById('progress-plot');
        var plotData = plotDiv.data;
        $.each(plotData, function (key, value) {
            var visibilty = false;
            if (key / 2 <= i) {
                visibilty = true;
            }
            plotDiv.data[key].visible = visibilty;
        });
        Plotly.redraw(plotDiv);
        // Plotly.restyle(container, update);
        $("#progress-slider-generation").text(i + 1);
    });
    progressSlider.noUiSlider.set(1);


    var handle = simpleSlider.querySelector('.noUi-handle');
    handle.setAttribute('tabindex', 0);
    handle.addEventListener('click', function () {
        this.focus();
    });
    handle.addEventListener('keydown', function (e) {
        var value = Number(simpleSlider.noUiSlider.get());
        switch (e.which) {
            case 37:
                simpleSlider.noUiSlider.set(value - 1);
                break;
            case 39:
                simpleSlider.noUiSlider.set(value + 1);
                break;
        }
    });
}

function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

function createData(rows, marker, name, visible = true) {
    if (marker == null) {
        marker = {
            color: 'rgb(23, 190, 207)',
            size: 4
        };
    }
    var solution_marker = {
        color: 'rgb(255, 0, 0)',
        size: 4
    };

    let xdata = unpack(rows, 0);
    let ydata = unpack(rows, 1);
    let zdata = unpack(rows, 2);
    let xsolution = xdata.pop();
    let ysolution = ydata.pop();
    let zsolution = zdata.pop();

    var data = [{
        x: xdata,
        y: ydata,
        z: zdata,
        mode: 'markers',
        name: name,
        type: 'scatter3d',
        visible: visible,
        marker: marker
    }, {
        x: [xsolution],
        y: [ysolution],
        z: [zsolution],
        mode: 'markers',
        name: 'Solution ' + name.toLowerCase(),
        type: 'scatter3d',
        visible: visible,
        marker: solution_marker
    }];
    return data;
}

function axisRange(data, axis) {
    var axisValue = {
        'x': 0,
        'y': 1,
        'z': 2
    };
    let max = data.map(function (gen) {
        return unpack(gen, axisValue[axis]).max();
        //return arr.max()
    }).max();
    let min = data.map(function (gen) {
        return unpack(gen, axisValue[axis]).min();
        //return arr.max()
    }).min();

    return [min, max]
}