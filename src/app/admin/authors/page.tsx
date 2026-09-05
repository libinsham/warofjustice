"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { isAxiosError } from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usersApi } from "@/lib/api/users";
import type { User } from "@/types";

const STATUS_VARIANT: Record<User["status"], "success" | "destructive" | "warning"> = {
  active: "success",
  suspended: "destructive",
  pending: "warning",
};

export default function AuthorsManagementPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const { data: authors, isLoading, error } = useQuery({
    queryKey: ["admin", "users", "author", search],
    queryFn: () => usersApi.list({ role: "author", search: search || undefined }),
  });

  const setStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: User["status"] }) => usersApi.setStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 403) {
        setPermissionError("Only Super Admins can manage author accounts.");
      }
    },
  });

  const isForbidden = isAxiosError(error) && error.response?.status === 403;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Authors</h2>
        <Input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {(isForbidden || permissionError) && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {permissionError ?? "Only Super Admins can view and manage author accounts."}
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isForbidden ? null : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(authors ?? []).map((author) => (
              <TableRow key={author.id}>
                <TableCell className="font-medium">{author.username}</TableCell>
                <TableCell>{author.email}</TableCell>
                <TableCell><Badge variant={STATUS_VARIANT[author.status]}>{author.status}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(author.date_joined).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {author.status === "pending" && (
                      <Button size="sm" onClick={() => setStatusMutation.mutate({ id: author.id, status: "active" })}>
                        Approve
                      </Button>
                    )}
                    {author.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => setStatusMutation.mutate({ id: author.id, status: "suspended" })}
                      >
                        Suspend
                      </Button>
                    )}
                    {author.status === "suspended" && (
                      <Button size="sm" variant="outline" onClick={() => setStatusMutation.mutate({ id: author.id, status: "active" })}>
                        Reactivate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(authors ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No authors found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
