import javax.persistence.*;
import java.util.List;

@Entity
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String routeName;

    @OneToMany(mappedBy = "route")
    private List<Bus> buses;

    @OneToMany(mappedBy = "route")
    private List<Stoppage> stoppages;

    @OneToMany(mappedBy = "route")
    private List<Student> students;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRouteName() { return routeName; }
    public void setRouteName(String routeName) { this.routeName = routeName; }

    public List<Bus> getBuses() { return buses; }
    public void setBuses(List<Bus> buses) { this.buses = buses; }

    public List<Stoppage> getStoppages() { return stoppages; }
    public void setStoppages(List<Stoppage> stoppages) { this.stoppages = stoppages; }

    public List<Student> getStudents() { return students; }
    public void setStudents(List<Student> students) { this.students = students; }
}