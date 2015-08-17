class WelcomeController < ApplicationController
  def index
    @presets = presets
  end

private
    def presets
        # This is a stub for a real presets list assembled from
        # an online city list.
        [
            {label: 'Brisbane', lat: -27.466667, lon: 153.033333},
            {label: 'Faringdon', lat: 51.657, lon:-1.586},
            {label: 'Oxford', lat: 51.751944, lon: -1.257778},
        ]
    end
end
