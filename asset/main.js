$(function () {
    $.getJSON('data/info.json', function (data) {
        var html = ""
        data.forEach(function (el) {
            html += "<tr>" +
                "<td>" + el['filename'] + "</td>" +
                "<td>" + el['method'] + "</td>" +
                "<td>" + el['problem'] + "</td>" +
                "<td>" + el['NGEN'] + "</td>" +
                "<td>" + el['pop_size'] + "</td>" +
                "<td>" + el['ind_size'] + "</td>" +
                "<td class='text-center'> <button type='button' class='btn btn-primary btn-xs btn-load' data-filename='" +
                el['filename'] +
                "' data-loading-text='Loading...'>Load</button> </td>" +
                "</tr>"
        });
        $('#table-files tbody').append(html);
    });

    $('body').on('click', '.btn-load', function () {
        let filename = $(this).data('filename');
        var $this = $(this);
        $this.button('loading');
        loadData(filename, $this);
    })

});

function loadData(filename, btn) {
    $.getJSON('data/' + filename, function (data) {

        //2D Visualization
        let dataPlot2d = data['2d']['data'];
        let solutionData = createSolucionData(data['2d']['solution'], {type: 'scatter'});
        var layout = {
            autosize: true,
            width: 710,
            height: 900,
            showlegend: true,
            margin: {t: 50},
            hovermode: 'closest',
            bargap: 0,
            xaxis: {
                range: axisRange(data['2d'], 'x'),
                domain: [0, 0.85],
                showgrid: false,
                zeroline: false
            },
            yaxis: {
                range: axisRange(data['2d'], 'y'),
                domain: [0, 0.85],
                showgrid: false,
                zeroline: false
            }
        };
        Plotly.newPlot('simple-plot-2d', [], layout);
        Plotly.addTraces('simple-plot-2d', solutionData);

        Plotly.newPlot('progress-plot-2d', [], layout);
        Plotly.addTraces('progress-plot-2d', solutionData);
        for (let i = 0; i < dataPlot2d.length; i++) {
            let newData = createData(dataPlot2d[i], {
                name: 'Generation ' + (i + 1),
                marker: {size: 4},
                type: 'scatter',
                visible: false
            });
            Plotly.addTraces('progress-plot-2d', newData);
        }

        Plotly.newPlot('progress-plot-2d', [], layout);
        Plotly.addTraces('progress-plot-2d', solutionData);
        for (let i = 0; i < dataPlot2d.length; i++) {
            let newData = createData(dataPlot2d[i], {
                name: 'Generation ' + (i + 1),
                marker: {size: 4},
                type: 'scatter',
                visible: false
            });
            Plotly.addTraces('progress-plot-2d', newData);
        }

        //3D visualization
        let dataPlot3d = data['3d']['data'];
        solutionData = createSolucionData(data['3d']['solution']);
        let layout3d = {
            autosize: true,
            title: 'Visualization',
            height: 710,
            width: 900,
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
                    range: axisRange(data['3d'], 'x'),
                    title: 'X',
                    type: 'linear',
                    zeroline: false
                },
                yaxis: {
                    range: axisRange(data['3d'], 'y'),
                    title: 'Y',
                    type: 'linear',
                    zeroline: false
                },
                zaxis: {
                    range: axisRange(data['3d'], 'z'),
                    title: 'Z',
                    type: 'linear',
                    zeroline: false
                }
            }
        };

        var chart = Plotly.newPlot('simple-plot', [], layout3d);
        Plotly.addTraces('simple-plot', solutionData);


        var chart2 = Plotly.newPlot('progress-plot', [], layout3d);
        Plotly.addTraces('progress-plot', solutionData);
        for (let i = 0; i < dataPlot3d.length; i++) {
            let newData = createData(dataPlot3d[i], {
                name: 'Generation ' + (i + 1),
                marker: {size: 4},
                visible: false
            });
            Plotly.addTraces('progress-plot', newData);
        }
        let fitness = data['extra']['fitness'];
        let fitnessMin = fitness.map(function (gen) {
            return gen.min();
        }).min();
        let fitnessMax = fitness.map(function (gen) {
            return gen.max();
        }).max();
        layout3d.showlegend = false;
        var chart3 = Plotly.newPlot('heatmap-plot', [], layout3d);
        Plotly.addTraces('heatmap-plot', solutionData);
        for (let i = 0; i < dataPlot3d.length; i++) {
            let newData = createData(dataPlot3d[i], {
                name: 'Generation ' + (i + 1),
                marker: {
                    color: colors(fitness[i], fitnessMin, fitnessMax),
                    size: 4
                },
                visible: false
            });
            Plotly.addTraces('heatmap-plot', newData);
        }
        initializeSliders(data);
    }).done(function () {
        btn.button('reset');
    });
}

function initializeSliders(data) {
    $('#simple-slider-2d, #progress-slider-2d, #simple-slider, #progress-slider, #heatmap-slider')
        .empty()
        .removeAttr('class')
        .each(function () {
            if (this.hasOwnProperty('noUiSlider')) {
                delete this.noUiSlider;
                var el = $(this);
            }
        });
    let fitness = data['extra']['fitness'];
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
    //2D Visualization sliders
    var dataPlot2d = data['2d']['data'];

    var simpleSlider2d = document.getElementById('simple-slider-2d');
    noUiSlider.create(simpleSlider2d, commonOptions, true);
    simpleSlider2d.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        let data = createData(dataPlot2d[i], {name: 'Generation ' + (i + 1), type: 'scatter'});
        if (document.getElementById('simple-plot-2d').data.length > 1) {
            Plotly.deleteTraces('simple-plot-2d', 1);
        }
        Plotly.addTraces('simple-plot-2d', data);
        $("#simple-slider-generation-2d").text(i + 1);
    });
    simpleSlider2d.noUiSlider.set(1);

    var progressSlider2d = document.getElementById('progress-slider-2d');
    noUiSlider.create(progressSlider2d, commonOptions, true);

    progressSlider2d.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        var plotDiv = document.getElementById('progress-plot-2d');
        var plotData = plotDiv.data;
        $.each(plotData, function (key, value) {
            var visibilty = false;
            if (key <= i + 1) {
                visibilty = true;
            }
            plotDiv.data[key].visible = visibilty;
        });
        Plotly.redraw(plotDiv);
        // Plotly.restyle(container, update);
        $("#progress-slider-generation-2d").text(i + 1);
    });
    progressSlider2d.noUiSlider.set(1);


    //3D Visualization sliders
    var dataPlot = data['3d']['data'];
    var simpleSlider = document.getElementById('simple-slider');
    noUiSlider.create(simpleSlider, commonOptions, true);

    simpleSlider.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        let data = createData(dataPlot[i], {
            name: 'Generation ' + (i + 1)
        });
        if (document.getElementById('simple-plot').data.length > 1) {
            // Plotly.deleteTraces('simple-plot', [0, 1]);
            Plotly.deleteTraces('simple-plot', 1);
        }
        Plotly.addTraces('simple-plot', data);
        $("#simple-slider-generation").text(i + 1);
    });
    simpleSlider.noUiSlider.set(1);

    // Progress Slider
    var progressSlider = document.getElementById('progress-slider');
    noUiSlider.create(progressSlider, commonOptions, true);

    progressSlider.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        var plotDiv = document.getElementById('progress-plot');
        var plotData = plotDiv.data;
        $.each(plotData, function (key, value) {
            var visibilty = false;
            if (key <= i + 1) {
                visibilty = true;
            }
            plotDiv.data[key].visible = visibilty;
        });
        Plotly.redraw(plotDiv);
        // Plotly.restyle(container, update);
        $("#progress-slider-generation").text(i + 1);
    });
    progressSlider.noUiSlider.set(1);

    // Heatmap Slider
    var heatmapSlider = document.getElementById('heatmap-slider');
    noUiSlider.create(heatmapSlider, commonOptions, true);

    heatmapSlider.noUiSlider.on('set', function () {
        let i = parseInt(this.get()) - 1;
        var plotDiv = document.getElementById('heatmap-plot');
        var plotData = plotDiv.data;
        $.each(plotData, function (key, value) {
            var visibilty = false;
            if (key <= i + 1) {
                visibilty = true;
            }
            plotDiv.data[key].visible = visibilty;
        });
        Plotly.redraw(plotDiv);
        // Plotly.restyle(container, update);
        $("#heatmap-slider-generation").text(i + 1);
    });
    heatmapSlider.noUiSlider.set(1);


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

function createSolucionData(solution, obj) {
    let solution_marker = {
        color: 'rgb(255, 0, 0)',
        size: 8
    };
    let tempObj = $.extend({
        name: 'Solution',
        marker: solution_marker
    }, obj);
    return createData([solution], tempObj);
}

function createData(rows, obj) {

    let marker = {
        color: 'rgb(23, 190, 207)',
        //color: ['red', 'blue', 'purple', 'yellow', "pink", 'red', 'blue', 'purple', 'yellow', "pink"],
        size: 4
    };
    let xdata = unpack(rows, 0);
    let ydata = unpack(rows, 1);
    let zdata = unpack(rows, 2);

    let parentObj = {
        x: xdata,
        y: ydata,
        //z: zdata,
        mode: 'markers',
        name: '',
        type: 'scatter3d',
        visible: true,
        marker: marker
    };
    if (zdata[0] !== undefined) {
        parentObj.z = zdata;
    }
    let tempData = $.extend(parentObj, obj);
    return [tempData];
}

function unpack(rows, key) {
    return rows.map(function (row) {
        return row[key];
    });
}

function axisRange(data, axis) {
    var axisValue = {
        'x': 0,
        'y': 1,
        'z': 2
    };
    let solution = data['solution'];
    let max = data['data'].map(function (gen) {
        return unpack(gen, axisValue[axis]).max();
        //return arr.max()
    }).max();
    max = [max, solution[axisValue[axis]]];
    max = max.max();
    let min = data['data'].map(function (gen) {
        return unpack(gen, axisValue[axis]).min();
        //return arr.max()
    }).min();
    min = [min, solution[axisValue[axis]]];
    min = min.min();

    return [min, max]
}

Array.prototype.max = function () {
    return Math.max.apply(null, this);
};

Array.prototype.min = function () {
    return Math.min.apply(null, this);
};

function colors(fitness, min, max) {
    let count = 5;
    let colors = [];
    // let startColor = [255, 255, 0];
    // let finalColor = [255, 0, 0];

    let startColor = [0, 255, 40];
    let finalColor = [0, 40, 255];
    let rDif = (startColor[0] - finalColor[0]) / count;
    let gDif = (startColor[1] - finalColor[1]) / count;
    let bDif = (startColor[2] - finalColor[2]) / count;
    //colors.push(finalColor);
    for (let i = 0; i < count; i++) {
        colors.push([
            Math.round(finalColor[0] + (i * rDif)),
            Math.round(finalColor[1] + (i * gDif)),
            Math.round(finalColor[2] + (i * bDif))
        ])
    }
    //colors.push(startColor);
    for (let i = 0; i < count; i++) {
        colors[i] = "rgb(" + colors[i].join(',') + ")";
    }
    colors = [
        "#00FF40",
        // "#1EFF74",
        "#35FFA6",
        // "#45FFD4",
        "#4BFFFF",
        // "#49E9FF",
         "#3EBDFF",
        //"#2A8EFF",
        // "#1E74FF",
        "#0040FF"

    ];
    console.info(colors);

    //let max = fitness.max();
    //let min = fitness.min();
    let ret_colors = [];
    let dif = (max - min) / count;

    for (let i = 0; i < fitness.length; i++) {
        let value = fitness[i];
        for (let j = 0; j < count; j++) {
            if (value >= (min + (j * dif)) && value <= (min + ((j + 1) * dif))) {
                ret_colors.push(colors[j]);
                break;
            }
            if (j == (count - 1)) {
                console.info(min + " - " + value + " - " + max);
            }
        }
    }
    return ret_colors;
}