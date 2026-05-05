interface Volunteer {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  skills: string[];
  status: 'active' | 'inactive';
}

class VolunteerService {
  private volunteers: Map<string, Volunteer> = new Map();

  addVolunteer(volunteer: Volunteer) {
    this.volunteers.set(volunteer.id, volunteer);
  }

  updateLocation(id: string, location: { lat: number; lng: number }) {
    const v = this.volunteers.get(id);
    if (v) {
      v.location = location;
      this.volunteers.set(id, v);
    }
  }

  removeVolunteer(id: string) {
    this.volunteers.delete(id);
  }

  getActiveVolunteers() {
    return Array.from(this.volunteers.values()).filter(v => v.status === 'active');
  }

  getNearbyVolunteers(lat: number, lng: number, radiusKm: number = 1) {
    const active = this.getActiveVolunteers();
    return active.filter(v => {
      const distance = this.calculateDistance(lat, lng, v.location.lat, v.location.lng);
      return distance <= radiusKm;
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const volunteerService = new VolunteerService();
