resource "aws_iam_role_policy" "ecr_full_policy" {
  name = "ecr_full_policy"
  role = "${aws_iam_role.node_instance_role.id}"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ecr:*"
      ],
      "Effect": "Allow",
      "Resource": "*"
    }
  ]
}
EOF
}
