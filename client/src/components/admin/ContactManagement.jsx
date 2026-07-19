import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [noteTexts, setNoteTexts] = useState({});

  const API_URL = process.env.REACT_APP_API_URL || 'https://biharkaswaad.in/api';

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const { data } = await axios.get(`${API_URL}/contacts${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(data.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const handleStatusChange = async (contactId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/contacts/${contactId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchContacts();
      alert('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAddNote = async (contactId) => {
    const text = noteTexts[contactId] || '';
    if (!text.trim()) return alert('Please enter note text');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/contacts/${contactId}/notes`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteTexts(prev => ({ ...prev, [contactId]: '' }));
      fetchContacts();
      alert('Note added');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleReply = async (contactId) => {
    const text = noteTexts[contactId] || '';
    if (!text.trim()) return alert('Please type a message to reply');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/contacts/${contactId}/reply`,
        { message: text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNoteTexts(prev => ({ ...prev, [contactId]: '' }));
      fetchContacts();
      alert('Reply sent & query resolved!');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    }
  };


  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Contact Inquiries</h2>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            .flex.gap-2.overflow-x-auto::-webkit-scrollbar { display: none; }
          `}</style>
          {['all', 'new', 'in-progress', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
                filter === f ? 'bg-orange-600 text-white' : 'bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : contacts.length === 0 ? (
        <p className="text-gray-600">No inquiries found</p>
      ) : (
        <div className="grid gap-4">
          {[...contacts].sort((a, b) => {
            if (a.status === 'resolved' && b.status !== 'resolved') return 1;
            if (a.status !== 'resolved' && b.status === 'resolved') return -1;
            return 0;
          }).map((contact) => (
            <div key={contact._id || contact.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <p className="text-gray-600">{contact.email}</p>
                  {contact.phone && <p className="text-gray-600">{contact.phone}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(contact.status)}`}>
                  {contact.status}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">Subject:</h4>
                <p>{contact.subject}</p>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">Message:</h4>
                <p className="text-gray-700">{contact.message}</p>
              </div>

              {contact.status === 'resolved' ? (
                <div className="flex items-center gap-4 mb-4 bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="text-green-700 font-bold flex items-center gap-2">
                    <i className="fa-solid fa-check-circle"></i> Inquiry Resolved
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Re-open this inquiry and mark as in-progress?')) {
                        handleStatusChange(contact._id || contact.id, 'in-progress');
                      }
                    }}
                    className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-100"
                  >
                    <i className="fa-solid fa-pen mr-1"></i> Edit Status
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => handleStatusChange(contact._id || contact.id, 'in-progress')}
                    className={`px-4 py-2 rounded text-white ${contact.status === 'in-progress' ? 'bg-yellow-600 opacity-50 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                    disabled={contact.status === 'in-progress'}
                  >
                    {contact.status === 'in-progress' ? 'Currently In Progress' : 'Mark In Progress'}
                  </button>
                  <button
                    onClick={() => handleStatusChange(contact._id || contact.id, 'resolved')}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <i className="fa-solid fa-check mr-1"></i> Mark Resolved
                  </button>
                </div>
              )}

              <div>
                <textarea
                  placeholder="Type a note or reply to customer..."
                  value={noteTexts[contact._id || contact.id] || ''}
                  onChange={(e) => {
                    const cid = contact._id || contact.id;
                    const val = e.target.value;
                    setNoteTexts(prev => ({ ...prev, [cid]: val }));
                  }}
                  className="w-full px-4 py-2 border rounded mb-2"
                  rows="3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddNote(contact._id || contact.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-semibold"
                  >
                    Add Internal Note
                  </button>
                  <button
                    onClick={() => handleReply(contact._id || contact.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold flex items-center gap-2 shadow-sm"
                  >
                    <i className="fa-solid fa-paper-plane"></i> Reply & Resolve
                  </button>
                </div>
              </div>

              {contact.notes && contact.notes.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold mb-2">Notes:</h4>
                  {contact.notes.map((note, idx) => (
                    <div key={idx} className="bg-gray-50 p-2 rounded mb-2">
                      <p className="text-sm">{note.text}</p>
                      <p className="text-xs text-gray-500">
                        {note.addedBy?.name} - {new Date(note.addedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactManagement;
