import { Award, BookOpen, Calendar, Users } from 'lucide-react';

export const features = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Expert Teachers",
    description: "Connect with qualified educators worldwide"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Rich Resources",
    description: "Access books, notes, and study materials"
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: "Flexible Scheduling",
    description: "Book classes at your convenience"
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Quality Education",
    description: "Verified teachers and structured learning"
  }
];

export const stats = [
  { number: "10K+", label: "Students" },
  { number: "500+", label: "Teachers" },
  { number: "50+", label: "Subjects" },
  { number: "95%", label: "Success Rate" }
];

export const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Student",
    rating: 5,
    text: "The platform made learning so much easier. Great teachers and flexible scheduling!"
  },
  {
    name: "Dr. Michael Chen",
    role: "Teacher",
    rating: 5,
    text: "Perfect platform to share knowledge and connect with students globally."
  },
  {
    name: "Emily Rodriguez",
    role: "Student",
    rating: 5,
    text: "Excellent resources and personalized learning experience."
  }
];
