require 'faraday'

class ForecastController < ApplicationController
  def show
    p = forecast_params
    @lat = p[:lat].to_f
    @lon = p[:lon].to_f
    @label = p[:label]

    @forecast_api = forecast_data_path
    # @forecast_api = '/forecast_data.json'  # Static data for testing
  end

  def data
    # Relay the API so that (a) the API key is nit exposed and (b) same-site-origin policy.
    # TODO. Cache results for 30min or so.

    # Assemble the API URL.
    p = forecast_params
    lat = p[:lat].to_f
    lon = p[:lon].to_f
    api_key = '69722368bb159b9382a755da2d26f597'  # TODO. Get this from config instead
    forecast_api = "https://api.forecast.io/forecast/#{api_key}/#{lat},#{lon}"

    # Get JSON from API and feed it straight back.
    forecast_response = ForecastController.connection.get(forecast_api, units: 'uk2')
    render body: forecast_response.body, content_type: 'application/json'
  end

  class << self
    def connection
      @connection ||= Faraday.new
    end
  end

private
  def forecast_params
    params.permit(:lat, :lon, :label)
  end
end
