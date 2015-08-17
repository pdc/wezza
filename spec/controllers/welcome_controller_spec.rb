require 'rails_helper'

RSpec.describe WelcomeController, type: :controller do
    describe "GET index" do
        it "assigns @presets" do
            get :index

            expect(assigns(:presets)).to include({label: 'Oxford', lat: 51.751944, lon: -1.257778})
            expect(assigns(:presets)).to include({label: 'Faringdon', lat: 51.657, lon:-1.586})
        end
    end
end
