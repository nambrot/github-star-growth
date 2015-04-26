class ReposController < ApplicationController

  def show
    params[:owner].gsub! "==", "."
    params[:repo_name].gsub! "==", "."

    begin
      data = Rails.cache.fetch "v1-#{params[:owner]}/#{params[:repo_name]}" do
        object = GithubStarGazerService.new(params[:owner], params[:repo_name])
        object.get_data
        object.stars_by_date
      end

      render json: data
    rescue Exception => e
      #again bad practice
      # presume fetching failed due to rate limiting. check whether this is a valid repo first
      if HTTParty.get("https://www.github.com/#{params[:owner]}/#{params[:repo_name]}").headers["status"] == "200 OK"
        CacheWarmer.perform_async "#{params[:owner]}/#{params[:repo_name]}"
        render json: { error: "Github API Rate limit reached" }, status: 429
      else
        render json: { error: "Unknown Repository" }, status: 404
      end
    end
  end

end
