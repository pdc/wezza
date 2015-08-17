class ForecastController < ApplicationController
  def show
    p = forecast_params
    @lat = p[:lat].to_f
    @lon = p[:lon].to_f
    @label = p[:label]
  end

private
  def forecast_params
    params.permit(:lat, :lon, :label)
  end
end
