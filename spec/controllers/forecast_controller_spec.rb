require 'rails_helper'

RSpec.describe ForecastController, type: :controller do
    describe "GET show" do
        it "assigns @lat and @lon" do
            get :show, lat: 123.123, lon: 45.678, label: 'Oxford'

            expect(assigns(:lat)).to eq(123.123)
            expect(assigns(:lon)).to eq(45.678)
        end
        it "assigns @label" do
            get :show, lat: 123.123, lon: 45.678, label: 'Oxford'

            expect(assigns(:label)).to eq('Oxford')
        end
        it "assigns @forecast_api" do
            get :show

            expect(assigns(:forecast_api)).not_to be_nil
            expect(assigns(:forecast_api)).not_to include('forecast.io//')
        end
        it "doesn’t assign @forecast_api to remote URL" do
            get :show

            expect(assigns(:forecast_api)).not_to include('forecast.io//')
        end
    end
end
