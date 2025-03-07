import React from "react";
import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import POIForm from "./POIForm";
import grp1IconImg from "../icons/pin/red_pin.png";
import grp2IconImg from "../icons/pin/orange_pin.png";
import grp3IconImg from "../icons/pin/blue_pin.png";
import grp4IconImg from "../icons/pin/green_pin.png";

const initMarker = ref => {
  if (ref) {
    ref.leafletElement.openPopup();
  }
};

export default class POIMarker extends React.Component {
  constructor(props) {
    super(props);
    this.leafletMarker = React.createRef();
    this.leafletMarker2 = React.createRef();
    this.state = {
      // Empty POIForm object for holding form input values
      newPOI: {
        id: this.props.poi.id,
        name: this.props.poi.name,
        description: this.props.poi.description,
        position: { lng: this.props.poi.lng, lat: this.props.poi.lat },
        image: this.props.poi.image,
        url: this.props.poi.url,
        isSaved: this.props.poi.isSaved,
        group: this.props.poi.group,
        icon: "",
        Creator: this.props.poi.Creator,
        Categories: this.props.poi.Categories,
        Tags: this.props.poi.Tags
      }
    };
  }

  updatePOI = poi => {
    this.setState({ newPOI: poi });
  };
  componentDidMount(): void {
    if (this.state.newPOI.isSaved)
      this.leafletMarker.leafletElement.on("mouseover", function(e) {
        this.openPopup();
      });
  }
  upDateValue = () => {
    this.setState({ newPOI: this.props.poi });
  };
  componentDidUpdate(
    prevProps: Readonly<P>,
    prevState: Readonly<S>,
    snapshot: SS
  ): void {}

  render() {
    let { poisList, addPoi } = this.props;
    let position = { lat: this.props.poi.lat, lng: this.props.poi.lng };

    let img;

    if (
      this.state.newPOI.Categories &&
      this.state.newPOI.Categories[0] != null &&
      this.state.newPOI.Categories[0].image != null
    ) {
      if (this.state.newPOI.Categories[0].image.length > 0)
        img = this.state.newPOI.Categories[0].image;
      else img = getIcon({ group: this.state.newPOI.group });
    } else img = getIcon({ group: this.state.newPOI.group });
    var myIcon = L.icon({
      iconUrl: img,
      iconSize: [20, 30],
      iconAnchor: [10, 30],
      popupAnchor: [0, -20]
    });

    if (this.state.newPOI.isSaved) {
      return (
        <div>
          <Marker
            ref={m => {
              this.leafletMarker = m;
            }}
            elevation={260.0}
            position={position}
            icon={myIcon}
            draggable="true"
            onmouseover={this.upDateValue}
          >
            <Popup>
              <h1>{this.state.newPOI.name}</h1>

              {this.state.newPOI.image != null && (
                <img width={100} height={100} src={this.state.newPOI.image} />
              )}
              <p>{this.state.newPOI.description}</p>
              {this.props.user &&
                this.state.newPOI.Creator.id === this.props.user.sub && (
                  <span>
                    <img
                      width={10}
                      height={10}
                      src="https://image.flaticon.com/icons/svg/61/61456.svg"
                      onClick={e => {
                        this.state.newPOI.isSaved = false;
                        this.updatePOI(this.state.newPOI);
                      }}
                    />
                    <br />
                  </span>
                )}
              {this.state.newPOI.Categories &&
                this.state.newPOI.Categories.map(cat => (
                  <div>
                    <img width={25} height={30} src={cat.image} />{" "}
                    <a>{cat.name}</a>
                  </div>
                ))}
              {this.state.newPOI.Tags.map(tag => (
                <div>
                  <img width={25} height={30} src={tag.image} />{" "}
                  <a>{tag.name}</a>
                </div>
              ))}
            </Popup>
          </Marker>
        </div>
      );
    } else
      return (
        <div>
          <Marker ref={initMarker} position={position} icon={myIcon}>
            <Popup>
              <div>{this.state.Creator}</div>
              <POIForm
                parentRef={this.leafletMarker2}
                poi={this.state.newPOI}
                tags={this.props.tags}
                categories={this.props.categories}
                getAllO={this.props.getAllO}
                addPoi={addPoi}
                poisList={poisList}
                updatePOI={this.updatePOI}
                position={position}
                id={this.state.newPOI.id}
              />
            </Popup>
          </Marker>
        </div>
      );
  }
}

function getIcon({ group, category }) {
  switch (group) {
    case 1:
      return grp1IconImg;
    case 2:
      return grp2IconImg;
    case 3:
      return grp3IconImg;
    case 4:
      return grp4IconImg;
    default:
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbDNpjszW24mRt28p47v7zq/bXZtrp/lWnXr337j3nPCe85NcypgSFdugCpW5YoDAMRaIMqRi6aKq5E3YqDQO3qAwjVWrD8Ncq/RBpykd8oZUb/kaJutow8r1aP9II0WmLKLIsJyv1w/kqw9Ch2MYdB++12Onxee/QMwvf4/Dk/Lfp/i4nxTXtOoQ4pW5Aj7wpici1A9erdAN2OH64x8OSP9j3Ft3b7aWkTg/Fm91siTra0f9on5sQr9INejH6CUUUpavjFNq1B+Oadhxmnfa8RfEmN8VNAsQhPqF55xHkMzz3jSmChWU6f7/XZKNH+9+hBLOHYozuKQPxyMPUKkrX/K0uWnfFaJGS1QPRtZsOPtr3NsW0uyh6NNCOkU3Yz+bXbT3I8G3xE5EXLXtCXbbqwCO9zPQYPRTZ5vIDXD7U+w7rFDEoUUf7ibHIR4y6bLVPXrz8JVZEql13trxwue/uDivd3fkWRbS6/IA2bID4uk0UpF1N8qLlbBlXs4Ee7HLTfV1j54APvODnSfOWBqtKVvjgLKzF5YdEk5ewRkGlK0i33Eofffc7HT56jD7/6U+qH3Cx7SBLNntH5YIPvODnyfIXZYRVDPqgHtLs5ABHD3YzLuespb7t79FY34DjMwrVrcTuwlT55YMPvOBnRrJ4VXTdNnYug5ucHLBjEpt30701A3Ts+HEa73u6dT3FNWwflY86eMHPk+Yu+i6pzUpRrW7SNDg5JHR4KapmM5Wv2E8Tfcb1HoqqHMHU+uWDD7zg54mz5/2BSnizi9T1Dg4QQXLToGNCkb6tb1NU+QAlGr1++eADrzhn/u8Q2YZhQVlZ5+CAOtqfbhmaUCS1ezNFVm2imDbPmPng5wmz+gwh+oHDce0eUtQ6OGDIyR0uUhUsoO3vfDmmgOezH0mZN59x7MBi++WDL1g/eEiU3avlidO671bkLfwbw5XV2P8Pzo0ydy4t2/0eu33xYSOMOD8hTf4CrBtGMSoXfPLchX+J0ruSePw3LZeK0juPJbYzrhkH0io7B3k164hiGvawhOKMLkrQLyVpZg8rHFW7E2uHOL888IBPlNZ1FPzstSJM694fWr6RwpvcJK60+0HCILTBzZLFNdtAzJaohze60T8qBzyh5ZuOg5e7uwQppofEmf2++DYvmySqGBuKaicF1blQjhuHdvCIMvp8whTTfZzI7RldpwtSzL+F1+wkdZ2TBOW2gIF88PBTzD/gpeREAMEbxnJcaJHNHrpzji0gQCS6hdkEeYt9DF/2qPcEC8RM28Hwmr3sdNyht00byAut2k3gufWNtgtOEOFGUwcXWNDbdNbpgBGxEvKkOQsxivJx33iow0Vw5S6SVTrpVq11ysA2Rp7gTfPfktc6zhtXBBC+adRLshf6sG2RfHPZ5EAc4sVZ83yCN00Fk/4kggu40ZTvIEm5g24qtU4KjBrx/BTTH8ifVASAG7gKrnWxJDcU7x8X6Ecczhm3o6YicvsLXWfh3Ch1W0k8x0nXF+0fFxgt4phz8QvypiwCCFKMqXCnqXExjq10beH+UUA7+nG6mdG/Pu0f3LgFcGrl2s0kNNjpmoJ9o4B29CMO8dMT4Q5ox8uitF6fqsrJOr8qnwNbRzv6hSnG5wP+64C7h9lp30hKNtKdWjtdkbuPA19nJ7Tz3zR/ibgARbhb4AlhavcBebmTHcFl2fvYEnW0ox9xMxKBS8btJ+KiEbq9zA4RthQXDhPa0T9TEe69gWupwc6uBUphquXgf+/FrIjweHQS4/pduMe5ERUMHUd9xv8ZR98CxkS4F2n3EUrUZ10EYNw7BWm9x1GiPssi3GgiGRDKWRYZfXlON+dfNbM+GgIwYdwAAAAASUVORK5CYII=";
  }
}
