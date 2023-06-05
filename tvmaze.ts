import axios from "axios";
import * as $ from "jquery";

const $showsList:  JQuery<HTMLElement> = $("#showsList");
const $episodesArea:  JQuery<HTMLElement> = $("#episodesArea");
const $searchForm:  JQuery<HTMLElement> = $("#searchForm");
const $episodeList:  JQuery<HTMLElement> = $("#episodeList");

const DEFAULT_IMAGE_URL: string =
  "https://store-images.s-microsoft.com/image/apps.65316.13510798887490672.6e1ebb25-96c8-4504-b714-1f7cbca3c5ad.f9514a23-1eb8-4916-a18e-99b1a9817d15?mode=scale&q=90&h=300&w=300";

const BASE_URL: string = "http://api.tvmaze.com"

//set an interface showing what the returned image needs to look like in
interface imageInterface {
  medium: string;
  original: string;
}

//set an interface showing what the returned objects need to look like
interface showInterface {
  id: number;
  name: string;
  summary: string;
  image: imageInterface | null;
}

//
interface responseObjectInterface {
  data: any[];
}

interface episodeInterface {
  id: number;
  name: string;
  season: number;
  number: number;
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
async function getShowsByTerm(
  term: string | number | string[]
): Promise<showInterface[]> {
  const response: responseObjectInterface = await axios.get(
    `${BASE_URL}/search/shows?q=${term}`
  );

  //format data for client

  const formattedShows: showInterface[] = response.data.map((item) => {
    let { id, name, summary, image } = item.show;
    image = image ? image.original : DEFAULT_IMAGE_URL;
    return { id, name, summary, image };
  });

  return formattedShows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: showInterface[]) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `
    );

    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<episodeInterface[]> {
  const response: responseObjectInterface = await axios.get(`${BASE_URL}/${id}/episodes}`);
  response;

  const formattedEpisodes: episodeInterface[] = response.data.map((episode) => {
    let { id, name, season, number } = episode;
    return { id, name, season, number };
  });
  return formattedEpisodes;
 }

/** Write a clear docstring for this function... */

function populateEpisodes(formattedEpisodes: episodeInterface[]): void {

  $episodeList.empty();

  for (let episode of formattedEpisodes) {
    const $episode = $(
      `<li>${episode.name} (${episode.season}, ${episode.number})</li>`
    );
    $episodeList.append($episode);
  }

}

function toggleEpisodesArea():
