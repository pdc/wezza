
class ForecastSource {
    setApi(api) {
        this.api = api;
        this.byLatLon = {};
        this.callbacks = {};
    }

    getForecast(lat, lon) {
        const k = lat + ',' + lon;
        return this.byLatLon[k];
    }

    checkForecastReady(lat, lon) {
        const k = lat + ',' + lon;
        return !!this.byLatLon[k];
    }

    loadForecast(lat, lon, callback) {
        const k = lat + ',' + lon;
        this.callbacks[k] = callback;  // Happily clobber any other listener

        if (k in this.byLatLon) {
            return;
        }
        $.ajax({
            url: this.api,
            data: {lat: lat, lon: lon},
            dataType: 'json',
            error: (jqXHR, textStatus, errorThrown) => {
                this.byLatLon[k] = {status: textStatus, error: errorThrown};
            }
        })
        .done(obj => {
            this.byLatLon[k] = obj;
        })
        .always(() => {
            if (this.callbacks[k]) {
                this.callbacks[k](this);
            }
        });
    }
}

const forecastSource = new ForecastSource();


const daysOfWeek = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];


var ForecastDetail = React.createClass({
    getInitialState: function () {
        return {
            isExpanded: false,
        };
    },

    handleClick: function (ev) {
        ev.preventDefault();

        this.setState({isExpanded: !this.state.isExpanded});
    },

    render: function () {
        if (!this.state.isExpanded) {
            return (
                <div className="forecast-detail-collapsed">
                    <h3><a onClick={this.handleClick}>Show more</a></h3>
                </div>);
        }

        const tableRows = this.props.data.map((r, i) => {
            const timeDate = new Date(1000 * r.time);
            const timeStr = (this.props.time === 'd'
                ? daysOfWeek[timeDate.getDay()]
                : (timeDate.getHours() < 10 ? '0' : '') + timeDate.getHours() + ':00');
            let row = [
                <td>{timeStr}</td>,
                <td>{r.summary}</td>
            ];
            if ('temperature' in r) {
                row.push(<td>{Math.round(r.temperature)}°</td>);
            } else {
                row.push(<td>{Math.round(r.temperatureMin)}°</td>);
                row.push(<td>{Math.round(r.temperatureMax)}°</td>);
            }
            return (<tr key={i} className={r.icon}>
                {row}
            </tr>);
        });
        return (
            <div className="forecast-detail-expanded">
                <h3><a href="#" onClick={this.handleClick}>Show less</a></h3>
                <table>
                    <tbody>
                        {tableRows}
                    </tbody>
                </table>
            </div>);
    },
});


var ForecastPart = React.createClass({
    render: function () {
        const data = this.props.data;
        const temperatureData = (data.temperature
            ? data : data.data[0]);
        const temperaturePart = (temperatureData.temperature &&
            <div className="forecast-part-temperature">
                <b>{Math.round(temperatureData.temperature)}°</b>
                <small>Feels like {Math.round(temperatureData.apparentTemperature)}°</small>
            </div>);
        const isDetail = (data.data
            && ('temperature' in data.data[0] || 'temperatureMin' in data.data[0]));
        return (
            <div className={'forecast-part ' + data.icon}>
                <h2>{this.props.title}</h2>
                <div className="forecast-part-summary">{data.summary}</div>
                {temperaturePart}
                {isDetail && <ForecastDetail data={data.data} time={this.props.time}/>}
            </div>);
    },
})


var Forecast = React.createClass({
    getInitialState: function () {
        return {
            isLoading: true,
        }
    },

    componentDidMount: function () {
        forecastSource.setApi(this.props.forecastApi);
        if (!forecastSource.checkForecastReady(this.props.lat, this.props.lon)) {
            forecastSource.loadForecast(this.props.lat, this.props.lon, this.handleForecastReady);
        }
    },

    handleForecastReady: function (forecastSource) {
        const forecast = forecastSource.getForecast(this.props.lat, this.props.lon);
        this.setState({
            isLoading: false,
            forecast,
        });
    },

    render: function () {
        if (this.state.isLoading) {
            return <div className="forecast forecast-loading"></div>;
        }

        const forecast = this.state.forecast;
        if (!forecast) {
            return <div className="forecast forecast-failed">Could not load forecast</div>;
        }
        if (forecast.error) {
            return (
                <div className="forecast forecast-error">
                    <p>{forecast.status}</p>
                    <p>{forecast.error}</p>
                </div>);
        }

        return (
            <div className='forecast'>
                <ForecastPart key="currently" title="Currently" data={forecast.currently} />
                {forecast.minutely && <ForecastPart key="hour" title="Next hour" data={forecast.minutely} />}
                <ForecastPart key="hourly" title="Next day" data={forecast.hourly} time="hm" />
                <ForecastPart key="daily" title="Next week" data={forecast.daily} time="d" />
            </div>);
    },
});
