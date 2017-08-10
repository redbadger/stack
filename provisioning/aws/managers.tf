resource "aws_launch_configuration" "manager" {
  name_prefix                 = "manager-"
  image_id                    = "${var.ami}"
  instance_type               = "t2.micro"
  associate_public_ip_address = false
  security_groups             = ["${aws_security_group.nodes.id}", "${aws_security_group.managers.id}", "${aws_security_group.ssh.id}"]
  key_name                    = "${aws_key_pair.manager.key_name}"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_key_pair" "manager" {
  key_name   = "manager-key"
  public_key = "${file("${var.ssh_public_key_file}")}"
}

resource "aws_autoscaling_group" "managers" {
  availability_zones  = ["${var.zones}"]
  vpc_zone_identifier = ["${var.private_subnets}"]
  name                = "microplatform-managers"

  min_size                  = 0
  max_size                  = 3
  desired_capacity          = 2
  wait_for_capacity_timeout = 0

  health_check_grace_period = 300
  health_check_type         = "ELB"
  launch_configuration      = "${aws_launch_configuration.manager.name}"
  termination_policies      = ["OldestInstance", "ClosestToNextInstanceHour"]
  default_cooldown          = 0

  lifecycle {
    create_before_destroy = true
  }
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

data "aws_iam_policy_document" "autoscaling_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["autoscaling.amazonaws.com"]
    }
  }
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

data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
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
}

resource "aws_lambda_permission" "with_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.register_dns.arn}"
  principal     = "sns.amazonaws.com"
  source_arn    = "${aws_sns_topic.register_dns.arn}"
}
