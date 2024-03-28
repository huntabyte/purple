select
	"id",
	"content",
	(
		SELECT
			id
		FROM
			"like"
		WHERE
			"post_id" = "id"
			AND "user_id" = ?
	) as "userLiked",
	(
		select
			json_array ("id", "username", "created_at", "updated_at") as "data"
		from
			(
				select
					*
				from
					"user" "posts_user"
				where
					"posts_user"."id" = "posts"."user_id"
				limit
					?
			) "posts_user"
	) as "user",
	(
		select
			coalesce(
				json_group_array (
					json_array (
						"id",
						"content",
						"user_id",
						"post_id",
						"created_at",
						"updated_at",
						(
							select
								json_array ("id", "username", "created_at", "updated_at") as "data"
							from
								(
									select
										*
									from
										"user" "posts_comments_user"
									where
										"posts_comments_user"."id" = "posts_comments"."user_id"
									limit
										?
								) "posts_comments_user"
						)
					)
				),
				json_array ()
			) as "data"
		from
			"comment" "posts_comments"
		where
			"posts_comments"."post_id" = "posts"."id"
	) as "comments",
	(
		select
			coalesce(
				json_group_array (
					json_array (
						"id",
						"user_id",
						"post_id",
						"created_at",
						"updated_at",
						(
							SELECT
								id
							FROM
								"like"
							WHERE
								"posts_likes"."post_id" = "posts_likes"."id"
								AND "posts_likes"."user_id" = ?
						),
						(
							select
								json_array ("id", "username", "created_at", "updated_at") as "data"
							from
								(
									select
										*
									from
										"user" "posts_likes_user"
									where
										"posts_likes_user"."id" = "posts_likes"."user_id"
									limit
										?
								) "posts_likes_user"
						)
					)
				),
				json_array ()
			) as "data"
		from
			"like" "posts_likes"
		where
			"posts_likes"."post_id" = "posts"."id"
	) as "likes"
from
	"post" "posts"
order by
	"posts"."created_at" desc -- params: ["ymsf1yad15nkki8", 1, 1, "ymsf1yad15nkki8", 1]