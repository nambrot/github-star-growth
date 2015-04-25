class ReposController < ApplicationController

  def show
    object = GithubStarGazerService.new(params[:owner], params[:repo_name])
    object.get_data

    render json: object.stars_by_date
  end

end
