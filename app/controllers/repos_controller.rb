class ReposController < ApplicationController

  def show
    data = Rails.cache.fetch "v1-#{params[:owner]}-#{params[:repo_name]}" do
      object = GithubStarGazerService.new(params[:owner], params[:repo_name])
      object.get_data
      object.stars_by_date
    end

    render json: data
  end

end
