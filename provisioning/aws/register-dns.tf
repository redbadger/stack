resource "aws_route53_zone" "local" {
  name          = "local."
  vpc_id        = "${var.vpc_id}"
  force_destroy = true
}

resource "aws_autoscaling_lifecycle_hook" "register_dns" {
  name                   = "register_dns"
  autoscaling_group_name = "${aws_autoscaling_group.managers.name}"
  lifecycle_transition   = "autoscaling:EC2_INSTANCE_LAUNCHING"

  default_result    = "ABANDON"
  heartbeat_timeout = 2000

  notification_metadata = <<EOF
{
  "action": "CREATE",
  "hostedZoneId": "${aws_route53_zone.local.zone_id}"
}
EOF

  notification_target_arn = "${aws_sns_topic.register_dns.arn}"
  role_arn                = "${aws_iam_role.iam_for_sns_notification.arn}"
}

resource "aws_autoscaling_lifecycle_hook" "deregister_dns" {
  name                   = "deregister_dns"
  autoscaling_group_name = "${aws_autoscaling_group.managers.name}"
  lifecycle_transition   = "autoscaling:EC2_INSTANCE_TERMINATING"

  default_result    = "CONTINUE"
  heartbeat_timeout = 2000

  notification_metadata = <<EOF
{
  "action": "DELETE",
  "hostedZoneId": "${aws_route53_zone.local.zone_id}"
}
EOF

  notification_target_arn = "${aws_sns_topic.register_dns.arn}"
  role_arn                = "${aws_iam_role.iam_for_sns_notification.arn}"
}

resource "aws_iam_role" "iam_for_sns_notification" {
  name               = "iam_for_sns_notification"
  assume_role_policy = "${data.aws_iam_policy_document.autoscaling_assume_role.json}"
}

data "aws_iam_policy_document" "sns_publish_policy" {
  statement {
    actions   = ["sns:Publish"]
    resources = ["${aws_sns_topic.register_dns.arn}"]
  }
}

resource "aws_iam_role_policy" "sns_publish_policy" {
  name   = "sns_publish_policy"
  role   = "${aws_iam_role.iam_for_sns_notification.id}"
  policy = "${data.aws_iam_policy_document.sns_publish_policy.json}"
}

resource "aws_sns_topic" "register_dns" {
  name = "register-dns-topic"
}

resource "aws_sns_topic_subscription" "register_dns" {
  topic_arn = "${aws_sns_topic.register_dns.arn}"
  protocol  = "lambda"
  endpoint  = "${aws_lambda_function.register_dns.arn}"
}

resource "aws_iam_role" "iam_for_register_dns_lambda" {
  name               = "iam_for_register_dns_lambda"
  assume_role_policy = "${data.aws_iam_policy_document.lambda_assume_role.json}"
}

data "aws_iam_policy_document" "lambda_policy" {
  statement {
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }

  statement {
    actions   = ["autoscaling:CompleteLifecycleAction"]
    resources = ["${aws_autoscaling_group.managers.arn}"]
  }

  statement {
    actions   = ["ec2:DescribeInstances"]
    resources = ["*"]
  }

  statement {
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = ["arn:aws:route53:::hostedzone/${aws_route53_zone.local.zone_id}"]
  }
}

resource "aws_iam_role_policy" "lambda_policy" {
  name   = "lambda_policy"
  role   = "${aws_iam_role.iam_for_register_dns_lambda.id}"
  policy = "${data.aws_iam_policy_document.lambda_policy.json}"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "register-dns/lib"
  output_path = "lambda.zip"
}

resource "aws_lambda_function" "register_dns" {
  filename         = "lambda.zip"
  function_name    = "register_managers_with_dns"
  role             = "${aws_iam_role.iam_for_register_dns_lambda.arn}"
  handler          = "index.handler"
  source_code_hash = "${data.archive_file.lambda_zip.output_base64sha256}"
  runtime          = "nodejs6.10"
  timeout          = 30
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.register_dns.arn}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.register_dns.arn}"
}
