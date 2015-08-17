
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
                this.callbacks[k]();
            }
        });
    }
}

var forecastSource = new ForecastSource();


var ForecastPart = React.createClass({
    render: function () {
        const data = this.props.data;
        const temperaturePart = (data.temperature &&
            <div className="forecast-part-temperature">
                <b>{data.temperature}°</b>
                <small>Feels like {data.apparentTemperature}°</small>
            </div>);
        return (
            <div className={'forecast-part forecast-part-' + data.icon}>
                <h2>{this.props.title}</h2>
                <div className="forecast-part-summary">{data.summary}</div>
                {temperaturePart}
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

    handleForecastReady: function () {
        const forecast = forecastSource.getForecast(this.props.lat, this.props.lon);
        this.setState({
            isLoading: false,
            forecast,
        });
    },

    render: function () {
        if (this.state.isLoading) {
            return <div className="forecast forecast-loading">LOADING…</div>;
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
                <ForecastPart key="hourly" title="Next day" data={forecast.hourly} />
                <ForecastPart key="daily" title="Next week" data={forecast.daily} />
            </div>);
    },
});
