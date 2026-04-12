import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.Column;
import javax.persistence.SequenceGenerator;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;

@Entity
public class RouteStoppage {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "route_stoppage_sequence")
    @SequenceGenerator(name = "route_stoppage_sequence", sequenceName = "route_stoppage_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne
    private Route route;

    @ManyToOne
    private Stoppage stoppage;

    @Column(name = "latitude")
    private double latitude;

    @Column(name = "longitude")
    private double longitude;

    @Column(name = "sequence")
    private int sequence;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Route getRoute() {
        return route;
    }

    public void setRoute(Route route) {
        this.route = route;
    }

    public Stoppage getStoppage() {
        return stoppage;
    }

    public void setStoppage(Stoppage stoppage) {
        this.stoppage = stoppage;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public int getSequence() {
        return sequence;
    }

    public void setSequence(int sequence) {
        this.sequence = sequence;
    }
}