import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Trash2, Plus, Bold, Italic, Heading } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const NewEventCreate = ({ showEventsCreatePopup ,HandleCreateEvents}) => {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        content: '',
        image: null,
        eventDate: null,
        venue: '',
        category: '',
        status: 'draft',
        teamMembers: [{ name: '', email: '' }],
        maxTeamMembers: 4,
        minTeamMembers: 2
    });

    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTeamMemberChange = (index, e) => {
        const { name, value } = e.target;
        const newTeamMembers = [...eventData.teamMembers];
        newTeamMembers[index][name] = value;
        setEventData(prev => ({
            ...prev,
            teamMembers: newTeamMembers
        }));
    };

    const addTeamMember = () => {
        if (eventData.teamMembers.length < eventData.maxTeamMembers) {
            setEventData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, { name: '', email: '' }]
            }));
        }
    };

    const removeTeamMember = (index) => {
        if (eventData.teamMembers.length > eventData.minTeamMembers) {
            const newTeamMembers = eventData.teamMembers.filter((_, i) => i !== index);
            setEventData(prev => ({
                ...prev,
                teamMembers: newTeamMembers
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEventData(prev => ({
                ...prev,
                image: file
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertContentToHTML = (content) => {
        // Simple markdown to HTML conversion
        return content
            .replace(/# (.*)/g, '<h1>$1</h1>')
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br/>');
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form
        if (!eventData.title || !eventData.description || !eventData.eventDate) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate team members
        if (
            eventData.teamMembers.length < eventData.minTeamMembers ||
            eventData.teamMembers.length > eventData.maxTeamMembers
        ) {
            alert(`Team must have between ${eventData.minTeamMembers} and ${eventData.maxTeamMembers} members`);
            return;
        }

        // Convert content to HTML
        const htmlContent = convertContentToHTML(eventData.content);

        // Log event details to console
        console.log('Event Details:', {
            ...eventData,
            htmlContent,
            imageName: eventData.image ? eventData.image.name : null
        });

        alert('Event Created Successfully!');
    };

    if (!showEventsCreatePopup) return null;

    return (
        <div className="fixed inset-0 transition-all duration-700 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="title">Event Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={eventData.title}
                            onChange={handleInputChange}
                            placeholder="Enter event title"
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={eventData.description}
                            onChange={handleInputChange}
                            placeholder="Brief event description"
                            required
                            className="w-full"
                        />
                    </div>

                    <div>
                        <Label>Event Content</Label>
                        <Textarea
                            id="content"
                            name="content"
                            value={eventData.content}
                            onChange={handleInputChange}
                            placeholder="Write your event content. Use ** for bold, # for headings"
                            rows={6}
                            className="w-full"
                        />
                        <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
                            <Heading className="h-4 w-4" />
                            <span>Use # for headings (# Title, ## Subtitle)</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                            <Bold className="h-4 w-4" />
                            <span>Use ** for bold text (e.g., **Important**)</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1 text-sm text-muted-foreground">
                            <Italic className="h-4 w-4" />
                            <span>Use * for italic text (e.g., *emphasis*)</span>
                        </div>
                    </div>

                    <div>
                        <Label>Event Date & Venue</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !eventData.eventDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {eventData.eventDate ? (
                                        format(eventData.eventDate, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <Calendar
                                    mode="single"
                                    selected={eventData.eventDate}
                                    onSelect={(date) => setEventData(prev => ({ ...prev, eventDate: date }))}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Input
                            name="venue"
                            value={eventData.venue}
                            onChange={handleInputChange}
                            placeholder="Enter event venue"
                            className="mt-4"
                        />
                    </div>

                    <div>
                        <Label>Team Members</Label>
                        {eventData.teamMembers.map((member, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                    name="name"
                                    value={member.name}
                                    onChange={(e) => handleTeamMemberChange(index, e)}
                                    placeholder="Member name"
                                    className="flex-1"
                                />
                                <Input
                                    name="email"
                                    value={member.email}
                                    onChange={(e) => handleTeamMemberChange(index, e)}
                                    placeholder="Member email"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => removeTeamMember(index)}
                                    className="flex-none"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button type="button" onClick={addTeamMember} className="mt-1">
                            <Plus className="h-4 w-4 mr-2" /> Add Team Member
                        </Button>
                    </div>

                    <div className="flex justify-between gap-4">
                        <div className="w-1/2">
                            <Label>Category</Label>
                            <Select
                                value={eventData.category}
                                onValueChange={(value) => setEventData(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="conference">Conference</SelectItem>
                                    <SelectItem value="workshop">Workshop</SelectItem>
                                    <SelectItem value="seminar">Seminar</SelectItem>
                                    <SelectItem value="webinar">Webinar</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-1/2">
                            <Label>Event Status</Label>
                            <Select
                                value={eventData.status}
                                onValueChange={(value) => setEventData(prev => ({ ...prev, status: value }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="private">Private</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="image">Event Image</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <img
                                    src={imagePreview}
                                    alt="Event Preview"
                                    className="max-w-full h-48 object-cover rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button type="button" variant="outline">Cancel</Button>
                        <Button onClick={HandleCreateEvents} type="submit" className="bg-primary text-primary-foreground">
                            Create Event
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewEventCreate;