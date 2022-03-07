import { Flight } from "../../api/flight";
import { useGetCommitBoundaryForFlightQuery } from "../../api/liberationApi";
import WaypointMarker from "../waypointmarker";
import { LatLng } from "leaflet";
import { ReactElement } from "react";
import { Polyline } from "react-leaflet";

const BLUE_PATH = "#0084ff";
const RED_PATH = "#c85050";
const SELECTED_PATH = "#ffff00";

interface FlightPlanProps {
  flight: Flight;
  selected: boolean;
}

const pathColor = (props: FlightPlanProps) => {
  if (props.selected) {
    return SELECTED_PATH;
  } else if (props.flight.blue) {
    return BLUE_PATH;
  } else {
    return RED_PATH;
  }
};

function FlightPlanPath(props: FlightPlanProps) {
  const color = pathColor(props);
  const waypoints = props.flight.waypoints;
  if (waypoints == null) {
    return <></>;
  }
  const points = waypoints
    .filter((waypoint) => waypoint.include_in_path)
    .map((waypoint) => waypoint.position);
  return (
    <Polyline
      positions={points}
      pathOptions={{ color: color, interactive: false }}
    />
  );
}

const WaypointMarkers = (props: FlightPlanProps) => {
  if (!props.selected || props.flight.waypoints == null) {
    return <></>;
  }

  var markers: ReactElement[] = [];
  props.flight.waypoints?.forEach((p, idx) => {
    markers.push(
      <WaypointMarker
        key={idx}
        number={idx}
        waypoint={p}
        flight={props.flight}
      />
    );
  });

  return <>{markers}</>;
};

interface CommitBoundaryProps {
  flightId: string;
  selected: boolean;
}

function CommitBoundary(props: CommitBoundaryProps) {
  const { data, error, isLoading } = useGetCommitBoundaryForFlightQuery({
    flightId: props.flightId,
  });
  if (isLoading) {
    return <></>;
  }
  if (error) {
    console.error(`Error loading commit boundary for ${props.flightId}`, error);
    return <></>;
  }
  if (!data) {
    console.log(
      `Null response data when loading commit boundary for ${props.flightId}`
    );
    return <></>;
  }
  // TODO: Fix the response model and clean up.
  const positions = data.map(([lat, lng]) => new LatLng(lat, lng));
  return (
    <Polyline
      positions={positions}
      color="#ffff00"
      weight={1}
      interactive={false}
    />
  );
}

function CommitBoundaryIfSelected(props: CommitBoundaryProps) {
  if (!props.selected) {
    return <></>;
  }
  return <CommitBoundary {...props} />;
}

export default function FlightPlan(props: FlightPlanProps) {
  return (
    <>
      <FlightPlanPath {...props} />
      <WaypointMarkers {...props} />
      <CommitBoundaryIfSelected
        flightId={props.flight.id}
        selected={props.selected}
      />
    </>
  );
}
