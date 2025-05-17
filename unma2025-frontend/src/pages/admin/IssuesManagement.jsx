import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

const IssuesManagement = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    category: "",
    priority: "",
    search: "",
    page: 1,
  });
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  // Fetch issues
  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["issues", filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`/api/issues?${params}`);
      return response.data;
    },
  });

  // Update issue status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, resolution }) => {
      const response = await axios.patch(`/api/issues/${id}/status`, {
        status,
        resolution,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
      toast.success("Issue status updated successfully");
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to update status");
    },
  });

  // Assign issue
  const assignIssueMutation = useMutation({
    mutationFn: async ({ id, assignedTo }) => {
      const response = await axios.patch(`/api/issues/${id}/assign`, {
        assignedTo,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
      toast.success("Issue assigned successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to assign issue");
    },
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      const response = await axios.post(`/api/issues/${id}/comments`, {
        text,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["issues"]);
      toast.success("Comment added successfully");
      setComment("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to add comment");
    },
  });

  const handleStatusUpdate = (status, resolution = "") => {
    updateStatusMutation.mutate({
      id: selectedIssue._id,
      status,
      resolution,
    });
  };

  const handleAssign = (assignedTo) => {
    assignIssueMutation.mutate({
      id: selectedIssue._id,
      assignedTo,
    });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    addCommentMutation.mutate({
      id: selectedIssue._id,
      text: comment,
    });
  };

  const IssueModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{selectedIssue.title}</h3>
            <p className="text-sm text-gray-500">
              Reported by {selectedIssue.reportedBy.name} on{" "}
              {format(new Date(selectedIssue.createdAt), "PPP")}
            </p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm font-medium text-gray-500">Category</span>
            <p className="mt-1">{selectedIssue.category}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Priority</span>
            <p className="mt-1">{selectedIssue.priority}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Status</span>
            <p className="mt-1">{selectedIssue.status}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">
              Assigned To
            </span>
            <p className="mt-1">
              {selectedIssue.assignedTo?.name || "Unassigned"}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-sm font-medium text-gray-500">Description</span>
          <p className="mt-1 whitespace-pre-wrap">
            {selectedIssue.description}
          </p>
        </div>

        {selectedIssue.attachments?.length > 0 && (
          <div className="mb-6">
            <span className="text-sm font-medium text-gray-500">
              Attachments
            </span>
            <div className="mt-2 space-y-2">
              {selectedIssue.attachments.map((attachment, index) => (
                <a
                  key={index}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  {attachment.filename}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <span className="text-sm font-medium text-gray-500">Comments</span>
          <div className="mt-2 space-y-4">
            {selectedIssue.comments?.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  By {comment.createdBy.name} on{" "}
                  {format(new Date(comment.createdAt), "PPP")}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded-md"
            rows={3}
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add Comment
          </button>
        </form>

        <div className="flex justify-end gap-2">
          <button
            onClick={() => handleStatusUpdate("In Progress")}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Mark In Progress
          </button>
          <button
            onClick={() => handleStatusUpdate("Resolved", "Issue resolved")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Mark Resolved
          </button>
          <button
            onClick={() => handleStatusUpdate("Closed", "Issue closed")}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Close Issue
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
        <p className="mt-2 text-gray-600">
          Manage and track reported issues from users
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
          className="p-2 border rounded-md"
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="p-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value, page: 1 })
          }
          className="p-2 border rounded-md"
        >
          <option value="">All Categories</option>
          <option value="Technical">Technical</option>
          <option value="Content">Content</option>
          <option value="Payment">Payment</option>
          <option value="Registration">Registration</option>
          <option value="Other">Other</option>
        </select>
        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters({ ...filters, priority: e.target.value, page: 1 })
          }
          className="p-2 border rounded-md"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {issuesData?.data.map((issue) => (
                <tr key={issue._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {issue.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {issue.category}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        issue.priority === "Critical"
                          ? "bg-red-100 text-red-800"
                          : issue.priority === "High"
                          ? "bg-orange-100 text-orange-800"
                          : issue.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        issue.status === "Open"
                          ? "bg-blue-100 text-blue-800"
                          : issue.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : issue.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {issue.reportedBy.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {issue.reportedBy.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(issue.createdAt), "PP")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedIssue(issue);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && selectedIssue && <IssueModal />}
    </div>
  );
};

export default IssuesManagement;
